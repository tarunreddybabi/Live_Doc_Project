import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  const clerkUsersMap = new Map(users?.map((user: User) => [user?.email, user]) || []);

  const usersData = userIds.map((email) => {
    const clerkUserData = clerkUsersMap.get(email);

    return {
      ...(clerkUserData ? { ...clerkUserData } : { email }), 
      email,
      userType: room.usersAccesses[email]?.includes("room:write") ? "editor" : "viewer",
    } as User; 
  });

  const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes("room:write")
    ? "editor"
    : "viewer";

  return (
    <main className="flex flex-col w-full items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
