import React from "react";
import { EmptyPlaceholder } from "@repo/ui/components/empty-placeholder";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/ui/card";
import ListViewTestSuites from "./list-view-test-suites";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import CreateTestSuiteDialog from "./create-test-suite-dialog";

interface ListTestSuitesProps {
  chatbotData: {
    id: string;
    name: string;
    description: string;
    link: string;
    updatedAt: string;
  }[];
  isLoading: boolean;
  children?: React.ReactNode;
}

const ListTestSuites = ({ chatbotData, isLoading }: ListTestSuitesProps) => {
  return (
    <div>
      {chatbotData?.length ? (
        <div className="flex flex-col gap-3 ">
          {chatbotData.map((chatbot) => (
            // <ListViewTestSuites key={chatbot.id} chatbot={chatbot} />
            <>hi</>
          ))}
        </div>
      ) : (
        <>
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>No chatbots created</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any chatbotss yet. Start creating.
            </EmptyPlaceholder.Description>
            <CreateTestSuiteDialog />
          </EmptyPlaceholder>
        </>
      )}
    </div>
  );
};

ListTestSuites.Skeleton = () => {
  return (
    <div className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
};

export default ListTestSuites;
