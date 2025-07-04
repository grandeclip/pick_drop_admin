import NextAuth from "next-auth";
import Google from "next-auth/providers/google";


const isAllowedEmail = (email: string) => {
	return email?.endsWith("@grandeclip.com");
};

export const { handlers, auth, signIn, signOut } = NextAuth({
	debug: !!process.env.AUTH_DEBUG,
	pages: {
		signIn: "/signin",
	},
	providers: [
		Google({
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
	],
	callbacks: {
		async signIn({ account, profile }) {
			if (account?.provider === "google") {
				if (profile?.email_verified) {
					return isAllowedEmail(profile?.email ?? "");
				}
				return false;
			}
			return false;
		},
		authorized: async ({ auth }) => {
			return !!auth;
		},
	},
});
