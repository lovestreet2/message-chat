import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import ChatRoomClient from "@/components/chat/ChatRoomClient";

export default async function ChatRoomPage(props: {
    params: Promise<{ roomId: string }>;
}) {
    const { roomId } = await props.params;

    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const userId = (session.user as any).id as string;

    const room = await prisma.room.findFirst({
        where: { id: roomId, members: { some: { userId } } },
        select: { id: true, name: true },
    });

    if (!room) redirect("/chat");

    return (
        <ChatRoomClient
            roomId={roomId}
            chatName={room.name}
            sessionUserId={userId}
        />
    );
}
