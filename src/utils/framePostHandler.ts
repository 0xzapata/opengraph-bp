import { NextApiRequest } from 'next';
import { extractBody } from './extractBody';
import { getFrameHtmlResponse } from '@coinbase/onchainkit';

export async function framePostHandler(req: NextApiRequest, initialButtonContent?: string) {
  const url = new URL(req.url ?? '');
  const position = url.searchParams.get('position');
  const body = JSON.parse(await extractBody(req.body));
  const buttonIndex = body.untrustedData?.buttonIndex;

  console.log({ body, position, buttonIndex });

  let hasPrevious = true;
  let buttonContent = '→';

  // when user interacts with initial frame, no position param exists. we can therefore assume
  // they've clicked `next` since it'll be the only available option
  if (!position) {
    // set the position for the next token
    url.searchParams.set('position', '1');

    // for all other tokens:
    // buttonIndex=1 maps to previous
    // buttonIndex=2 maps to next
  } else if (buttonIndex) {
    // if we're on the second token and the user clicks `prev`, we should bump the user back to the first token
    // by deleting the position param so they won't see a `prev` arrow
    if (Number(position) === 1 && Number(buttonIndex) === 1) {
      hasPrevious = false;
      url.searchParams.delete('position');

      if (initialButtonContent) {
        buttonContent = initialButtonContent;
      }
    } else if (Number(buttonIndex) === 1) {
      // `prev` should decrement the position
      url.searchParams.set('position', `${Number(position) - 1}`);
    }

    // `next` should increment the position
    if (Number(buttonIndex) === 2) {
      // if the position is incremented beyond the length of the set, `getTokensDisplay` will
      // handle this edge case when the image is fetched
      url.searchParams.set('position', `${Number(position) + 1}`);
    }
  }

  const headers = new Headers();
  headers.append('Content-Type', 'text/html');

  const showTwoButtons = hasPrevious;
  const buttons = [
    ...(hasPrevious ? [{ label: '←', action: 'prev' }] : []), // Conditionally add the "previous" button
    { label: buttonContent, action: 'next' }, // This could be '→' or the initial button content
  ];

  const image = url.toString(); // Assuming `url` is a URL object and you want to use its string representation

  const postUrl = url.toString(); // Similarly, using the URL's string representation for the post URL

  const html = getFrameHtmlResponse({
    buttons,
    image: {
      src: image,
      aspectRatio: '1:1',
    },
    postUrl,
  });

  return new Response(html, {
    status: 200,
    headers,
  });
}
