import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";

import { appRouter } from "~~/server/routers";

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  const { response } = await handler.handle(request, {
    prefix: "/rpc",
    context: { headers: request.headers, getAuth: event.context.auth },
  });

  if (response) {
    return response;
  }

  setResponseStatus(event, 404, "Not Found");
  return "Not found";
});
