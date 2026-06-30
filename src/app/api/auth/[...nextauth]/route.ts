import NextAuth, { NextAuthOptions } from 'next-auth';
import pool from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "roblox",
      name: "Roblox",
      type: "oauth",
      clientId: process.env.ROBLOX_CLIENT_ID,
      clientSecret: process.env.ROBLOX_CLIENT_SECRET,
      wellKnown: "https://apis.roblox.com/oauth/.well-known/openid-configuration",
      authorization: { params: { scope: "openid profile" } },
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username,
          image: profile.picture,
        }
      },
    }
  ],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // user is only defined on the first sign in
      if (user) {
        token.robloxId = user.id;
        
        try {
          // Fetch user's Roblox group ranks
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
          
          // Upsert into Supabase database using pg pool
          const client = await pool.connect();
          try {
            const res = await client.query(`
              INSERT INTO public.users (roblox_id, username, main_group_rank, police_group_rank)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (roblox_id) DO UPDATE SET 
                username = EXCLUDED.username,
                main_group_rank = EXCLUDED.main_group_rank,
                police_group_rank = EXCLUDED.police_group_rank
              RETURNING id, is_flagged, main_group_rank, police_group_rank
            `, [user.id, user.name, mainRank, policeRank]);
            
            const dbUser = res.rows[0];
            token.dbId = dbUser.id;
            token.mainRank = dbUser.main_group_rank;
            token.policeRank = dbUser.police_group_rank;
            token.isFlagged = dbUser.is_flagged;
          } finally {
            client.release();
          }
        } catch(err) {
          console.error("Error fetching Roblox groups or DB upsert:", err);
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
