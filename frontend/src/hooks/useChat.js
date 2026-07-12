import { useChatContext } from '../contexts/ChatContext';

export const useChat = () => {
  return useChatContext();
};
