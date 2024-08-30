"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { useTheme } from "next-themes";
import { Icons } from "@repo/ui/components/icons";
import {
  OrganizationList,
  OrganizationSwitcher,
  useAuth,
  useOrganizationList,
  useUser,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  // user: Pick<User, "image" | "name" | "email">;
  organization?: any;
}

export const userMembershipsParams = {
  memberships: {
    pageSize: 5,
    keepPreviousData: true,
  },
};

export function UserAccountNav() {
  const { setTheme, theme } = useTheme();
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const {
    userMemberships,
    setActive,
    isLoaded: isOrgLoaded,
  } = useOrganizationList({
    userMemberships: userMembershipsParams,
  });
  const router = useRouter();

  if (!isLoaded || !isOrgLoaded) {
    return <Icons.spinner className="animate-spin" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center w-8 h-8 space-x-3 rounded-full bg-accent text-accent-foreground">
          <UserAvatar
            user={{
              name: user?.imageUrl || null,
              image: user?.imageUrl || null,
            }}
            className="w-8 h-8"
          />
          {/* user email*/}
          {/* <div className="flex flex-col items-start justify-start space-y-1">
            {user.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
            {organization?.name && (
              <p className="text-sm">{organization?.name}</p>
            )}
          </div> */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.fullName && <p className="font-medium">{user.fullName}</p>}
            {user?.primaryEmailAddress && (
              <>
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
                {/* <p className="w-[200px] truncate text-sm ">
                  {organization?.name}
                </p> */}
              </>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change Org</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <>
                  {userMemberships?.data?.map((membership) => (
                    <DropdownMenuItem
                      key={membership.id}
                      onSelect={() =>
                        setActive({
                          organization: membership.organization.id,
                        })
                      }
                    >
                      <div className="">
                        <div className="flex items-center gap-20">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center bg-accent rounded-full text-accent-foreground">

                              <UserAvatar
                                user={{
                                  name: membership.organization.name,
                                  image: membership.organization.imageUrl,
                                }}
                                className="w-8 h-8"
                              />
                            </div>
                            <p>{membership.organization.name}</p>
                          </div>
                          <Icons.settings className="w-4 h-4" />
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={() => {
                      console.log("create new organization");
                      router.push("create-organization");
                    }}
                  >
                    Create new organization
                  </DropdownMenuItem>
                </>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/billing">Billing</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
          }}
        >
          Sign out
        </DropdownMenuItem>
        {/* <DropdownMenuItem>
          <ModeToggle />
        </DropdownMenuItem> */}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Switch theme</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                {["light", "dark", "system"].map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    checked={theme === option}
                    onClick={() => setTheme(option)}
                    className="capitalize"
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
