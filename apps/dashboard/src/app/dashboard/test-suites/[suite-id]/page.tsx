"use client";
import LiveStreamer from "@/components/live-debugger/live-streamer";
import ListViewTestCases from "@/components/test-suites/list-view-test-cases";
import TestSuiteDetails from "@/components/test-suites/test-suite-details";
import OperationBar from "@/components/test-suites/test-suite-operation-bar";
import axiosInstance from "@/config/axios";
import { TEST_SUITES } from "@/config/endpoints";
import { useSocket } from "@/contexts/socket-provider";
import { useAuth } from "@clerk/nextjs";
import { DashboardShell } from "@repo/ui/components/shell";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/ui/resizable";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React from "react";
import useSWR from "swr";

const SuitPage = ({ params }: { params: { "suite-id": string } }) => {
  console.log(params);
  const { getToken } = useAuth();

  const { socket, state } = useSocket();
  const [testSuite, setTestSuite] = React.useState<any>({});
  const [testCases, setTestCases] = React.useState<any[]>([]);
  const [debuggerUrl, setDebuggerUrl] = React.useState("");

  const { data, isLoading, error, mutate } = useSWR(
    `${TEST_SUITES}/${params["suite-id"]}`,
    async () => {
      const response = await axiosInstance.get(
        `${TEST_SUITES}/${params["suite-id"]}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken({
              template: "codlez_template",
            })}`,
          },
        }
      );

      setTestSuite(response.data);
      setTestCases(response.data.test_cases);

      return response.data;
    }
  );

  const reorderTestCases = async (testCaseIds: string[]) => {
    const res = await axiosInstance.post(
      `${TEST_SUITES}/${params["suite-id"]}/test-case/reorder`,
      {
        testCaseIds,
      },
      {
        headers: {
          Authorization: `Bearer ${await getToken({
            template: "codlez_template",
          })}`,
        },
      }
    );

    mutate();
  };

  const handleStartExecution = async () => {
    console.log("start execution", socket);
    socket?.emit("execute-test-suite", {
      testSuiteId: params["suite-id"],
      organizationId: data?.organization_id,
    });
  };

  socket?.on(`test-suite-status-${params["suite-id"]}`, (statusData) => {
    const ne = {
      ...testSuite,
      latest_result: statusData.latest_result,
      latest_run: statusData.latest_run,
    };
    setTestSuite(ne);
  });

  const updateTestCaseStatus = async (testCaseId: string, status: string) => {
    const testCase = testCases.find((testCase) => testCase.id === testCaseId);
    const updatedTestCase = { ...testCase, latest_result: status };
    const updatedTestCases = testCases.map((testCase) =>
      testCase.id === testCaseId ? updatedTestCase : testCase
    );
    setTestCases(updatedTestCases);
  };

  socket?.on("exception", (error) => {
    console.log(error);
  });

  socket?.on(`debugger-url-${params["suite-id"]}`, ({url}) => {
    console.log(url);
    setDebuggerUrl(url);
  });

  const createTestCase = async ({
    action,
    previousTestCaseId,
    nextTestCaseId,
  }: {
    action: string;
    previousTestCaseId: string;
    nextTestCaseId: string;
  }) => {
    const res = await axiosInstance.post(
      `${TEST_SUITES}/${params["suite-id"]}/test-case`,
      {
        action,
        next_step_id: nextTestCaseId,
        previous_step_id: previousTestCaseId,
      },
      {
        headers: {
          Authorization: `Bearer ${await getToken({
            template: "codlez_template",
          })}`,
        },
      }
    );

    mutate();
  };

  if (isLoading) return <div>Loading...</div>;

  console.log(data);

  return (
    <DashboardShell className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel className="h-full flex flex-col overflow-auto">
          <TestSuiteDetails testSuite={testSuite} />
          <OperationBar onStartExecution={handleStartExecution} />
          <ListViewTestCases
            headId={testSuite?.head_test_case}
            testCases={testCases}
            testSuiteId={params["suite-id"]}
            columnId="test-cases-col"
            reorderTestCases={reorderTestCases}
            createTestCase={createTestCase}
            disabled={isLoading ? true : false}
            updateTestCaseStatus={updateTestCaseStatus}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <LiveStreamer
            testSuiteId={params["suite-id"]}
            organizationId={data?.organization_id}
            debuggerUrl={debuggerUrl} 
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </DashboardShell>
  );
};

export default SuitPage;
