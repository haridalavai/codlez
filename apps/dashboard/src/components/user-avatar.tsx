import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Icons } from "@repo/ui/components/icons";
import { User } from "@repo/db";

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, "image" | "name">;
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <AvatarImage alt="Picture" src={user.image} />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
          <Icons.user className="w-4 h-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
