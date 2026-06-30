import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Roblox Username",
      credentials: {
        username: { label: "Roblox Username", type: "text", placeholder: "e.g. Builderman" }
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;
        
        try {
          // 1. Get Roblox ID from username
          const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [credentials.username], excludeBannedUsers: true })
          });
          const userData = await userRes.json();
          
          if (!userData.data || userData.data.length === 0) {
            return null; // User not found
          }
          
          const robloxUser = userData.data[0];
          const userId = robloxUser.id;
          const username = robloxUser.name;

          // Fetch actual avatar
          const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
          const thumbData = await thumbRes.json();
          const avatarUrl = thumbData.data?.[0]?.imageUrl || '';

          return {
            id: userId.toString(),
            name: username,
            image: avatarUrl
          };
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
        
        try {
          const groupsRes = await fetch(`https://groups.roblox.com/v2/users/${user.id}/groups/roles`);
          const groupsData = await groupsRes.json();
          
          let mainRank = 0;
          let policeRank = 0;
          
          if (groupsData && groupsData.data) {
            const mainGroup = groupsData.data.find((g: any) => g.group.id === 11750006);
            if (mainGroup) mainRank = mainGroup.role.rank;
            
            const policeGroup = groupsData.data.find((g: any) => g.group.id === 11874550);
            if (policeGroup) policeRank = policeGroup.role.rank;
          }
          
          const { data: dbUser, error } = await supabase
            .from('users')
            .upsert({
              roblox_id: user.id,
              username: user.name,
              main_group_rank: mainRank,
              police_group_rank: policeRank
            }, { onConflict: 'roblox_id' })
            .select('id, is_flagged, main_group_rank, police_group_rank')
            .single();

          if (error) {
            console.error("Supabase upsert error:", error);
          } else if (dbUser) {
            token.dbId = dbUser.id;
            token.mainRank = dbUser.main_group_rank;
            token.policeRank = dbUser.police_group_rank;
            token.isFlagged = dbUser.is_flagged;
          }
        } catch(err) {
          console.error("Error fetching Roblox groups or Supabase upsert:", err);
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
        (session.user as any).isFlagged = token.isFlagged;
      }
      return session;
    }
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
