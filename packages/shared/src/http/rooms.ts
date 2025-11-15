// import * as z from "zod";
// import Common from "./common";

// const Name = Common.Name.optional();
// const ActiveBoardStateId = Common.Id;

// const CreateBody = z.object({ name: Name.optional() }).strict();

// const UpdateBody = z
//   .object({
//     name: Name.optional(),
//     activeBoardStateId: ActiveBoardStateId.optional(),
//   })
//   .strict()
//   .refine(Common.refineFn, Common.refineMsg);

// const Rooms = { CreateBody, UpdateBody };
// export default Rooms;
