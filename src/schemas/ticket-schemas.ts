import { CreateTicketBody } from "@/protocols";
import Joi from "joi";

export const CreateTicketSchema = Joi.object<CreateTicketBody>({
  ticketTypeId: Joi.number().min(1).required()
})