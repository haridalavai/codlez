import { Icons } from "@repo/ui/components/icons";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import React, { useState } from "react";

interface CreateTestCaseComponentProps {
  testSuiteId: string;
  previousTestCaseId: string | null;
  nextTestCaseId: string | null;
  createTestCase: (testCase: any) => void;
  orderTestCases: (testCases: Record<string, any>[]) => void;
}

const CreateTestCaseComponent = ({
  testSuiteId,
  nextTestCaseId,
  previousTestCaseId,
  createTestCase,
  orderTestCases,
}: CreateTestCaseComponentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    setIsEditing(true);
  };

  const handleCheckClick = () => {
    // set error if input has less than 2 words

    setIsLoading(true);

    console.log("testCase", previousTestCaseId, nextTestCaseId);

    if (inputValue.split(" ").length < 2) {
      setErrors({ name: { message: "Please enter atleast 2 words" } });
      setIsLoading(false);
      return;
    }

    createTestCase({
      action: inputValue,
      previousTestCaseId: previousTestCaseId,
      nextTestCaseId: nextTestCaseId,
    });

    setIsEditing(false);
    // Here you can handle the submitted value (e.g., send it to a server)
    console.log("Submitted value:", inputValue);
    setInputValue("");
    setErrors({});
    setIsLoading(false);
  };

  const handleCrossClick = () => {
    setErrors({});
    setInputValue("");
    setIsEditing(false);
  };

  return (
    <div
      className={cn([
        "relative w-full  group",
        isEditing ? "h-full" : "h-[1px]",
      ])}
    >
      <div
        className={cn([
          "inset-x-0  -bottom-1 flex items-center justify-center",
          isEditing ? "relative" : "absolute",
        ])}
      >
        {!isEditing && (
          <div
            className={cn([
              "absolute w-full h-[1px] bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out",
            ])}
          />
        )}
        <div
          className={cn([
            isEditing ? "relative" : "absolute",
            "w-full h-full flex items-center justify-center",
          ])}
        >
          {isEditing ? (
            <div
              className={cn([
                "bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 w-full p-[1px] rounded-md",
              ])}
            >
              <div
                className={cn([
                  "flex flex-row items-center justify-start space-x-2 bg-background w-full p-2 h-full rounded-md",
                ])}
              >
                <div className="">
                  <Input
                    type="text"
                    placeholder="Enter text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className=" w-full"
                  />
                  {errors?.name && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCheckClick}
                  className={cn([
                    "h-8 w-8 p-0 ",
                    // on hover gradient background with pink purple and blue
                  ])}
                >
                  {isLoading ? (
                    <Icons.spinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icons.check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCrossClick}
                  className="h-8 w-8 p-0"
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className={cn([
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out delay-100 shadow-md ",
                "hover:bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 hover:text-black  ",
              ])}
              onClick={handleButtonClick}
            >
              Add Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTestCaseComponent;
