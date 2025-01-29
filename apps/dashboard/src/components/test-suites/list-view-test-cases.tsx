import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant"; // NEW
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

import TestCase from "./test-case";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import CreateTestCaseComponent from "./create-test-case-component";

export interface ListViewTestCasesProps {
  testSuiteId: string;
  headId: string;
  testCases: Record<string, any>[];
  columnId: string;
  reorderTestCases: (testCaseIds: string[]) => void;
  createTestCase: (testCase: any) => void;
  disabled?: boolean;
  updateTestCaseStatus: (testCaseId: string, status: string) => void;
}

const ListViewTestCases = ({
  headId,
  testCases,
  testSuiteId,
  columnId,
  reorderTestCases,
  createTestCase,
  updateTestCaseStatus,
  disabled = false,
}: ListViewTestCasesProps) => {
  const [testCasesOrderedList, setTestCasesOrderedList] = useState<
    Record<string, any>[]
  >([]);

  const orderTestCases = (testCases: Record<string, any>[]) => {
    const head = testCases.find((testCase) => testCase.id === headId);
    let currentTestCase = head;
    console.log(currentTestCase);
    const orderedTestCases = [];
    while (currentTestCase) {
      orderedTestCases.push(currentTestCase);
      currentTestCase = testCases.find(
        (testCase) => testCase.id === currentTestCase?.next_test_case_id
      );
    }

    setTestCasesOrderedList(orderedTestCases);
  };

  useEffect(() => {
    orderTestCases(testCases);
  }, [testCases]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  console.log(testCases);

  function handleDragEnd(event: any) {
    const { active, over } = event;

    console.log(event);

    if (active.id !== over.id) {
      const oldIndex = testCasesOrderedList.findIndex(
        (testCase) => testCase.id === active.id
      );
      const newIndex = testCasesOrderedList.findIndex(
        (testCase) => testCase.id === over.id
      );

      const reorderedTestCases = arrayMove(
        testCasesOrderedList,
        oldIndex,
        newIndex
      );

      const testCaseIds = reorderedTestCases.map((testCase) => testCase.id);

      setTestCasesOrderedList(reorderedTestCases);

      reorderTestCases(testCaseIds);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={testCasesOrderedList}
        strategy={verticalListSortingStrategy}
      >
        <CreateTestCaseComponent
        className="mt-2 "
          testSuiteId={testSuiteId}
          nextTestCaseId={testCases ? testCases[0]?.id : null}
          previousTestCaseId={null}
          createTestCase={createTestCase}
          orderTestCases={orderTestCases}
        />
        <ScrollArea className="flex flex-col h-full pb-14 pt-2 pl-2 pr-4">
          {testCasesOrderedList.map((testCase) => {
            return (
              <>
                <TestCase
                  key={testCase.id}
                  cardId={testCase.id}
                  name={testCase.name}
                  description={testCase.description}
                  action={testCase.action}
                  status={testCase.latest_result}
                  updateTestCaseStatus={updateTestCaseStatus}
                />
                <div className="flex flex-col my-1">
                  <CreateTestCaseComponent
                    testSuiteId={testSuiteId}
                    nextTestCaseId={testCase.next_test_case_id}
                    previousTestCaseId={testCase.id}
                    createTestCase={createTestCase}
                    orderTestCases={orderTestCases}
                  />
                </div>
              </>
            );
          })}
        </ScrollArea>
      </SortableContext>
    </DndContext>
  );
};

export default ListViewTestCases;
