import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/ui/card";
import { Avatar } from "@repo/ui/components/ui/avatar";
import { Icons } from "@repo/ui/components/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@repo/ui/components/ui/dropdown-menu";

interface ListViewTestSuitesProps {
  chatbot: {
    id: string;
    name: string;
    description: string;
    link: string;
    updatedAt: string;
    workflows: any;
    endpoints: any;
  };
}
const ListViewTestSuites = ({ chatbot }: ListViewTestSuitesProps) => {
  console.log("test suite", chatbot);
  const router = useRouter();
  return (
    <Card className="grid grid-cols-12 gap-4 h-full text-md text-muted-foreground p-4 items-start md:items-center ">
      <div className="col-span-11">
        <div className="flex flex-row justify-between items-center ">
          <div className="flex flex-col  items-start grid-cols-11">
            <div className="flex flex-row gap-3 justify-center items-center">
              <Icons.logo
                className="h-12 w-12 border 
            border-primary-foreground rounded-full p-2
            "
              />
              <div>
                <CardTitle>
                  <Button
                    variant="link"
                    onClick={() =>
                      router.push(`/dashboard/test-suite/${chatbot.id}`)
                    }
                    className="text-lg p-0 m-0 "
                  >
                    {chatbot.name}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {chatbot.description.slice(0, 20)}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-col ">
            <p>{`${chatbot.workflows.length} workflows`}</p>
            <p>{`${chatbot.endpoints.length} endpoints`}</p>
          </div>
          <div className=" text-sm">
            Updated{" "}
            {`${new Date(chatbot.updatedAt).toLocaleString("default", {
              month: "short",
            })} ${new Date(chatbot.updatedAt).getFullYear()}`}
          </div>
        </div>
      </div>
      <div className="col-span-1 items-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 transition-colors border rounded hover:bg-muted">
            <Icons.ellipsis className="w-4 h-4" />
            <span className="sr-only">Open</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center cursor-pointer text-destructive focus:text-destructive"
              // onSelect={() => setShowDeleteAlert(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default ListViewTestSuites;
