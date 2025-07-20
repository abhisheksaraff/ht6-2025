import {
  fetchEventSource,
  EventStreamContentType,
} from "@microsoft/fetch-event-source";

export const GetAIResponse = (
  addContent: (chunk: string) => void,
  contents: string[], callback: () => Promise<void>
) => {
  const params = new URLSearchParams();
  contents.forEach((str) => params.append("contents", str));
  params.append("search", "false");

  const evtSource = new EventSource(
    `http://127.0.0.1:8787/api/generate?${params}`
  );

  evtSource.onmessage = (event) => {
    if (event.data) {
      const data = event.data;
      addContent(data);
    }
  };

  //return () => evtSource.close();

  fetchEventSource(`http://127.0.0.1:8787/api/generate?${params}`, {
    async onopen(response) {
      if (
        response.ok &&
        response.headers.get("content-type") === EventStreamContentType
      ) {
        return; // everything's good
      } else if (
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 429
      ) {
        // client-side errors are usually non-retriable:
        throw new Error();
      } else {
        throw new Error();
      }
    },
    onmessage(msg) {
      // if the server emits an error message, throw an exception
      // so it gets handled by the onerror callback below:
      if (msg.event === "FatalError") {
        throw new Error(msg.data);
      }
      if (msg.data) {
        const data = msg.data;
        addContent(data);
      }
    },
    onclose() {
      // if the server closes the connection unexpectedly, retry:
      callback().catch(e => {
        console.error(e)
      })
    },

    onerror(err) {
      if (err instanceof Error) {
        throw err; // rethrow to stop the operation
      } else {
        // do nothing to automatically retry. You can also
        // return a specific retry interval here.
      }
    },

  });
};
