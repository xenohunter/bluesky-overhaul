import {Post} from '@atproto/api/dist/src/types/app/bsky/getPostThread';
import {BskyAgent} from '@atproto/api';

export class LoginError extends Error {}

export const getAgent = async (identifier: string, password: string): Promise<BskyAgent> => {
  const agent = new BskyAgent({service: 'https://bsky.social'});
  // TODO : cache session
  try {
    await agent.login({identifier, password});
    return agent;
  } catch {
    throw new LoginError();
  }
};

export const fetchPost = async (agent: BskyAgent, username: string, postId: string): Promise<Post> => {
  const did = await agent.resolveHandle({ handle: username }).then((response) => response.data.did);
  const response = await agent.getPostThread({uri: `at://${did}/app.bsky.feed.post/${postId}`});
  return response.data.thread.post as Post;
};
