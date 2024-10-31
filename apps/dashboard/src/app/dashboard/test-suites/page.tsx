"use client";
import React from "react";
import { DashboardShell } from "@repo/ui/components/shell";
import { DashboardHeader } from "@repo/ui/components/header";
import CreateTestSuiteDialog from "@/components/test-suites/create-test-suite-dialog";
import useSWR from "swr";
import { TEST_SUITES } from "@/config/endpoints";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { EmptyPlaceholder } from "@repo/ui/components/empty-placeholder";
import { Input } from "@repo/ui/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import axiosInstance from "@/config/axios";

const TestSuits = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [search, setSearch] = React.useState("");
  
  const { data,isLoading, error } = useSWR(TEST_SUITES, async () => {
    const token = await getToken({
      template: "codlez_template",
    });
    const response = await axiosInstance.get(TEST_SUITES, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }


  console.log("data", data);
  return (
    <DashboardShell>
      <div className="flex flex-row justify-between items-center mt-5">
        <Input
          placeholder="Search Test Suites"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96"
        />
        <CreateTestSuiteDialog />
      </div>
      <div >
        {data?.length ? (
          <div >
            {data.map((testSuites: any) => (
              <Card>
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle>{testSuites.name}</CardTitle>
                    <CardDescription>{testSuites.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <div>
                      <Link href={`${testSuites.link}`}>
                        <Button variant={"link"}>View File</Button>
                      </Link>
                      <Button
                        variant={"link"}
                        onClick={() =>
                          router.push(`/dashboard/test-suites/${testSuites.id}`)
                        }
                      >
                        Explore Specs File
                      </Button>
                    </div>
                    <div>
                      Updated{" "}
                      {`${new Date(testSuites.updatedAt).toLocaleString(
                        "default",
                        { month: "short" }
                      )} ${new Date(testSuites.updatedAt).getFullYear()}`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="post" />
              <EmptyPlaceholder.Title>
                No Test Suites Found
              </EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                You don&apos;t have any Test Suites yet. Start creating content.
              </EmptyPlaceholder.Description>
              <CreateTestSuiteDialog />
            </EmptyPlaceholder>
          </>
        )}
      </div>
    </DashboardShell>
  );
};

export default TestSuits;
