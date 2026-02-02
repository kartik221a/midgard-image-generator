import ProtectedLayout from "@/components/ProtectedLayout";
import Navigation from "@/components/Navigation";

export const metadata = {
    title: "Story Studio - StoryGen",
    description: "Create your AI storybook",
};

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedLayout>
            <Navigation />
            {children}
        </ProtectedLayout>
    );
}
