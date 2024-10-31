import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button, buttonVariants } from "@repo/ui/components/ui/button";
import { Icons } from "@repo/ui/components/icons";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { testSuiteSchema } from "@/lib/validations/test-suits";
import axios from "@/config/axios";
import { DialogClose } from "@repo/ui/components/ui/dialog";
import useSWR from "swr";
import { TEST_SUITES } from "@/config/endpoints";
import { useAuth } from "@clerk/nextjs";

type FormData = z.infer<typeof testSuiteSchema>;

const CreateTestSuiteDialog = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data, mutate } = useSWR(TEST_SUITES);
  const { getToken } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(testSuiteSchema),
  });

  const onClick = async (e: FormData) => {
    try {
      setIsLoading(true);

      const res = await axios.post(
        TEST_SUITES,
        {
          name: e.name,
          description: e.description,
          url: e.url,
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

      setIsLoading(false);
      setDialogOpen(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <Button>
          {isLoading ? (
            <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Icons.add className="w-4 h-4 mr-2" />
          )}{" "}
          New Test Suite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Test Suite</DialogTitle>
          <DialogDescription className="grid gap-6">
            Create a new Test Suite
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onClick)} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4"></div>
          <div className="grid gap-2">
            <Label htmlFor="test_suite_name">Name</Label>
            <Input
              id="test_suite_name"
              placeholder="Enter name for your test suite"
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a description for your test suite"
              {...register("description")}
            />
            {errors?.description && (
              <p className="px-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="Enter the URL" {...register("url")} />
            {errors?.url && (
              <p className="px-1 text-xs text-red-600">{errors.url.message}</p>
            )}
          </div>
          <Button type="submit" variant={"default"}>
            {isLoading && (
              <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
            )}
            Submit
          </Button>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTestSuiteDialog;
