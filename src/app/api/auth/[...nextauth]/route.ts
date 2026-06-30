import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "MoD Terminal",
      credentials: {
        username: { label: "Roblox Username", type: "text", placeholder: "e.g. Builderman" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        try {
          // Check if user exists in our DB first (case-insensitive for username could be handled, but we use strict for now)
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('username', credentials.username)
            .single();

          if (existingUser) {
            // User exists, verify password
            if (!existingUser.password_hash) return null;
            const isValid = await bcrypt.compare(credentials.password, existingUser.password_hash);
            if (!isValid) return null;

            // Fetch actual avatar
            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${existingUser.roblox_id}&size=420x420&format=Png&isCircular=false`);
            const thumbData = await thumbRes.json();
            const avatarUrl = thumbData.data?.[0]?.imageUrl || '';

            return {
              id: existingUser.roblox_id,
              name: existingUser.username,
              image: avatarUrl
            };
          } else {
            // User does not exist, First Time Registration Flow
            const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usernames: [credentials.username], excludeBannedUsers: true })
            });
            const userData = await userRes.json();
            
            if (!userData.data || userData.data.length === 0) {
              throw new Error("Roblox user not found");
            }
            
            const robloxUser = userData.data[0];
            const userId = robloxUser.id;
            const username = robloxUser.name;

            // Hash their provided password
            const passwordHash = await bcrypt.hash(credentials.password, 10);
            
            // Fetch groups right here to populate initial DB record
            const groupsRes = await fetch(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);
            const groupsData = await groupsRes.json();
            
            let mainRank = 0;
            let mainRole = '';
            let policeRank = 0;
            let policeRole = '';
            
            if (groupsData && groupsData.data) {
              const mainGroup = groupsData.data.find((g: any) => g.group.id === 11750006);
              if (mainGroup) {
                mainRank = mainGroup.role.rank;
                mainRole = mainGroup.role.name;
              }
              
              const policeGroup = groupsData.data.find((g: any) => g.group.id === 11874550);
              if (policeGroup) {
                policeRank = policeGroup.role.rank;
                policeRole = policeGroup.role.name;
              }
            }

            const { data: newUser, error } = await supabase
              .from('users')
              .insert({
                roblox_id: userId.toString(),
                username: username,
                password_hash: passwordHash,
                main_group_rank: mainRank,
                police_group_rank: policeRank,
                main_group_role: mainRole,
                police_group_role: policeRole
              })
              .select('id, is_flagged, main_group_rank, police_group_rank, main_group_role, police_group_role')
              .single();

            if (error) {
              console.error("Supabase insert error:", error);
              return null;
            }

            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
            const thumbData = await thumbRes.json();
            const avatarUrl = thumbData.data?.[0]?.imageUrl || '';

            return {
              id: userId.toString(),
              name: username,
              image: avatarUrl
            };
          }
        } catch (e) {
          console.error("Authorize error:", e);
          return null;
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.robloxId = user.id;
      }
      
      // Update groups every time a token is issued on login
      if (user) {
        try {
          const groupsRes = await fetch(`https://groups.roblox.com/v2/users/${user.id}/groups/roles`);
          const groupsData = await groupsRes.json();
          
          let mainRank = 0;
          let mainRole = '';
          let policeRank = 0;
          let policeRole = '';
          
          if (groupsData && groupsData.data) {
            const mainGroup = groupsData.data.find((g: any) => g.group.id === 11750006);
            if (mainGroup) {
              mainRank = mainGroup.role.rank;
              mainRole = mainGroup.role.name;
            }
            
            const policeGroup = groupsData.data.find((g: any) => g.group.id === 11874550);
            if (policeGroup) {
              policeRank = policeGroup.role.rank;
              policeRole = policeGroup.role.name;
            }
          }
          
          const { data: dbUser, error } = await supabase
            .from('users')
            .update({
              main_group_rank: mainRank,
              police_group_rank: policeRank,
              main_group_role: mainRole,
              police_group_role: policeRole
            })
            .eq('roblox_id', user.id)
            .select('id, is_flagged, main_group_rank, police_group_rank, main_group_role, police_group_role')
            .single();

          if (error) {
             console.error("Supabase update error:", error);
          } else if (dbUser) {
            token.dbId = dbUser.id;
            token.mainRank = dbUser.main_group_rank;
            token.policeRank = dbUser.police_group_rank;
            token.mainRole = dbUser.main_group_role;
            token.policeRole = dbUser.police_group_role;
            token.isFlagged = dbUser.is_flagged;
          }
        } catch(err) {
          console.error("Error updating Roblox groups:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).robloxId = token.robloxId;
        (session.user as any).dbId = token.dbId;
        (session.user as any).mainRank = token.mainRank;
        (session.user as any).policeRank = token.policeRank;
        (session.user as any).mainRole = token.mainRole;
        (session.user as any).policeRole = token.policeRole;
        (session.user as any).isFlagged = token.isFlagged;
      }
      return session;
    }
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
