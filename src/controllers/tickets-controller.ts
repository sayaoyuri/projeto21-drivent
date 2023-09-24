import { AuthenticatedRequest } from "@/middlewares";
import {  CreateTicketBody } from "@/protocols";
import { ticketService } from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getTicketTypes (req: AuthenticatedRequest, res: Response) {
  const tickets = await ticketService.getTicketTypes();

  res.status(httpStatus.OK).send(tickets);
}

export async function getTicketByUserId (req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const ticket = await ticketService.getTicketByUserId(userId);

  res.status(httpStatus.OK).send(ticket);
}

export async function createTicket (req: AuthenticatedRequest, res: Response) {
  const { ticketTypeId } = req.body as CreateTicketBody;

  const ticket = await ticketService.createTicket(req.userId, ticketTypeId);
  res.status(httpStatus.CREATED).send(ticket);
}