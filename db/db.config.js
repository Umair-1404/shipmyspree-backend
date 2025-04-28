import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error"],
});

export default prisma;
//Warning: You did not specify an output path for your `generator` in schema.prisma. This behavior is deprecated and will no longer be supported in Prisma 7.0.0. To learn more visit https://pris.ly/cli/output-patEPERM: operation not permitted, rename 'C:\Aipex\shipmyspree-backend\node_modules\.prisma\client\query_engine-windows.dll.node.tmp18856' -> 'C:\Aipex\shipmyspree-backend\node_modules\.prisma\client\query_engine-windows.dll.node'