import { Chunk } from "./types";

export const fetchResponse = async function* (id: string, ctx: ) {
  // TODO: authentication id
  // TODO: abort signal
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    // const chunk: Message = {
    //   id: `message-${i}`,
    //   content: `${i}`,
    //   type: "system",
    //   completed: i == 9,
    //   newSection: i == 0,
    // };

    const chunk: Chunk = `${i} `;
    yield chunk;
  }
};
