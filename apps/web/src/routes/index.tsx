import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import { usePrivateRoute } from "@/hooks/usePrivate";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { user } = useUser();
  const privateQuery = usePrivateRoute();

  return (
    <div>
      <h1>Index Route</h1>

      <SignedIn>
        <p>You are signed in</p>
        <p>{`${user?.fullName}, ${user?.primaryEmailAddress?.emailAddress}`}</p>

        <button onClick={() => privateQuery.refetch()}>
          Call backend
        </button>

        <UserButton />

        {privateQuery.isFetching && <p>Loading...</p>}
        {privateQuery.data && <pre>{JSON.stringify(privateQuery.data, null, 2)}</pre>}
        {privateQuery.error && <p style={{ color: "red" }}>Error: {privateQuery.error.message}</p>}
      </SignedIn>

      <SignedOut>
        <p>You are signed out</p>
        <SignInButton />
      </SignedOut>
    </div>
  );
}
