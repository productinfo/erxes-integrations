import { debugNylas } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { compose, sendRequest } from '../utils';
import { GOOGLE_OAUTH_TOKEN_VALIDATION_URL } from './constants';
import {
  createOrGetNylasConversation as storeConversation,
  createOrGetNylasConversationMessage as storeMessage,
  createOrGetNylasCustomer as storeCustomer,
} from './store';
import { IFilter, IMessageDraft } from './types';
import { nylasRequest, nylasSendMessage } from './utils';

/**
 * Build message and send API request
 * @param {String} - child function name
 * @param {String} - accessToken
 * @param {String} - filter
 * @param {Promise} - nylas message object
 */
const buildMessage = (child: string, ...args: Array<string | IFilter>) => {
  const [accessToken, filter] = args;

  return nylasRequest({
    parent: 'messages',
    child,
    accessToken,
    filter,
  });
};

/**
 * Get messages
 * @param {String} - accessToken
 * @param {Object} - filter
 * @returns {Promise} - nylas list of messagas
 */
const getMessages = (...args: string[]) => buildMessage('list', ...args);

/**
 * Get message by filtered args
 * @param {String} - accessToken
 * @param {Object} - filter
 * @returns {Promise} - nylas message object
 */
const getMessageById = (...args: string[]) => buildMessage('find', ...args);

/**
 * Get most recent messages
 * @param {String} - accessToken
 * @returns {Promise} - nylas messages object
 */
const recentMessages = (accessToken: string) => buildMessage('find', accessToken, { in: 'inbox' });

/**
 * Send or Reply message
 * @param {String} accessToken
 * @param {Object} args - message object
 * @returns {Promise} message object response
 */
const sendMessage = (accessToken: string, args: IMessageDraft) => nylasSendMessage(accessToken, args);

/**
 * Google: get email from google with accessToken
 * @param accessToken
 * @returns {Promise} email
 */
const getEmailFromAccessToken = async (accessToken: string) => {
  const data = { access_token: accessToken, fields: ['email'] };

  const { email } = await sendRequest({
    url: GOOGLE_OAUTH_TOKEN_VALIDATION_URL,
    method: 'post',
    body: data,
  });

  return email;
};

/**
 * Sync messages with messageId from webhook
 * @param {String} accountId
 * @param {String} messageId
 * @retusn {Promise} nylas messages object
 */
const syncMessages = async (accountId: string, messageId: string) => {
  const account = await Accounts.findOne({ uid: accountId }).lean();

  if (!account) {
    return debugNylas('Account not found with uid: ', accountId);
  }

  const integration = await Integrations.findOne({ accountId: account._id });

  if (!integration) {
    return debugNylas('Integration not found with accountId: ', account._id);
  }

  const { nylasToken, email, kind } = account;

  const message = await getMessageById(nylasToken, messageId);

  const [from] = message.from;

  // Prevent to sent email by itself
  if (from.email === account.email && !message.subject.includes('Re:')) {
    return;
  }

  const doc = {
    kind,
    message: JSON.parse(message),
    toEmail: email,
    integrationIds: {
      id: integration._id,
      erxesApiId: integration.erxesApiId,
    },
  };

  // Store new received message ========
  return compose(
    storeMessage,
    storeConversation,
    storeCustomer,
  )(doc);
};

export { syncMessages, sendMessage, recentMessages, getMessageById, getMessages, getEmailFromAccessToken };