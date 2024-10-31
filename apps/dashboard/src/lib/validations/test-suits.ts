import * as z from "zod";

export const testSuiteSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  url: z.string().nonempty(),
});
