import { signIn } from "@/auth";

export default function Page() {
	return (
		<div className="h-screen w-screen flex items-center justify-center p-5">
			<form
				action={async () => {
					"use server";

					await signIn("google", { redirectTo: "/" });
				}}
			>
				<button type="submit" className="btn btn-soft btn-secondary">
					안녕 까치걸
				</button>
			</form>
		</div>
	);
}
