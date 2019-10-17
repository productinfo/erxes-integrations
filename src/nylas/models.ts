import { Document, model, Model, Schema } from 'mongoose';
import { field } from '../models/utils';

export interface INylasCustomer {
  email: string;
  firstName: string;
  lastName: string;
  erxesApiId: string;
  integrationId: string;
  kind: string;
}

export interface INylasCustomerDocument extends INylasCustomer, Document {}
export interface INylasCustomerModel extends Model<INylasCustomerDocument> {}

// Customer =============
const customerCommonSchema = {
  _id: field({ pkey: true }),
  email: { type: String, unique: true },
  erxesApiId: String,
  firstName: String,
  lastName: String,
  integrationId: String,
  kind: String,
};

export const nylasGmailCustomerSchema = new Schema(customerCommonSchema);

// tslint:disable-next-line
export const NylasGmailCustomers = model<INylasCustomerDocument, INylasCustomerModel>(
  'customers_nylas_gmail',
  nylasGmailCustomerSchema,
);

export interface INylasConversation {
  to: string;
  from: string;
  threadId: string;
  content: string;
  customerId: string;
  erxesApiId: string;
  createdAt: Date;
  integrationId: string;
  kind: string;
}

export interface INylasConversationDocument extends INylasConversation, Document {}

// Conversation ==========
const conversationCommonSchema = {
  _id: field({ pkey: true }),
  to: { type: String, index: true },
  from: { type: String, index: true },
  threadId: { type: String, index: true },
  content: String,
  customerId: String,
  erxesApiId: String,
  integrationId: String,
  createdAt: field({ type: Date, index: true, default: new Date() }),
};

export interface INylasConversatonModel extends Model<INylasConversationDocument> {}

export const nylasGmailConversationSchema = new Schema(conversationCommonSchema);

// tslint:disable-next-line
export const NylasGmailConversations = model<INylasConversationDocument, INylasConversatonModel>(
  'conversations_nylas_gmail',
  nylasGmailConversationSchema,
);

// Conversation message ===========
export interface IEmail {
  name: string;
  email: string;
}

export interface IAttachments {
  id: string;
  object: string;
  content_type: string;
  size: number;
  filename: string;
  message_ids: string[];
}

export interface ILabels {
  id: string;
  name: string;
  displayName: string;
}

export interface INylasConversationMessage {
  conversationId: string;
  erxesApiMessageId: string;

  // Message type
  messageId: string;
  subject: string;
  account_id: string;
  replyTo: [IEmail];
  to: [IEmail];
  from: [IEmail];
  cc: [IEmail];
  bcc: [IEmail];
  date: string;
  thread_id: string;
  snippet: string;
  body: string;
  files: [IAttachments];
  labels: [ILabels];
}

export interface INylasConversationMessageDocument extends INylasConversationMessage, Document {}

const emailSchema = new Schema({ name: String, email: String }, { _id: false });

const attachmentsSchema = new Schema(
  {
    id: String,
    object: String,
    content_type: String,
    size: Number,
    filename: String,
    message_ids: [String],
  },
  { _id: false },
);

const labelsSchema = new Schema(
  {
    id: String,
    name: String,
    displayName: String,
  },
  { _id: false },
);

const conversationMessageCommonSchema = {
  _id: field({ pkey: true }),
  conversationId: String,
  customerId: String,
  erxesApiMessageId: String,
  messageId: String,
  id: String,
  subject: String,
  body: String,
  accountId: String,
  replyTo: [emailSchema],
  to: [emailSchema],
  from: [emailSchema],
  cc: [emailSchema],
  bcc: [emailSchema],
  date: String,
  threadId: String,
  snipped: String,
  attachments: [attachmentsSchema],
  labels: [labelsSchema],
};

export const nylasConversationMessageSchema = new Schema(conversationMessageCommonSchema);

export interface INylasConversationMessageModel extends Model<INylasConversationMessageDocument> {}

// tslint:disable-next-line
export const NylasGmailConversationMessages = model<INylasConversationMessageDocument, INylasConversationMessageModel>(
  'conversation_messages_nylas_gmail',
  nylasConversationMessageSchema,
);