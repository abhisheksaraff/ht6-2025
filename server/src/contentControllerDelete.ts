import { Context } from "hono";
import { post, put} from  "./contentController";

// env.VARIABLE;
// UUID v7
// ttl 10 * 60
// {
//   content: ""
//   role: "" // user or model or system
// }

// return
// {
//   id: "",
//   ttl: ttl,
// }
const postContent = async (c: Context) => {
  
};

// UUID v7
// reset ttl to = 10mins
//{
//   id: "",
//   content: "" optional
// } res.status(200)

// return
// {
//   id: "",
//   ttl: ttl,
// } res.status(200)
const putContent = async () => {};

const optionsContent = async () => {};

export { postContent, putContent, optionsContent };

