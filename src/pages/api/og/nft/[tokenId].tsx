import { ImageResponse } from "@vercel/og";
import { fetchWithJustQueryText, getPreviewUrls } from "../../../../fetch";
import { tokenIdOpengraphQuery } from "../../../../queries/tokenIdOpengraphQuery";
import { NextRequest } from "next/server";
import { openBracket } from "../../../../assets/svg/OpenBracket";
import {
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
} from "../post/[postId]";

export const config = {
  runtime: "edge",
};

let baseUrl = "https://gallery.so";
let apiBaseUrl = "https://gallery-opengraph.vercel.app";

// can manually set the preview URL via environment variables on vercel for the `opengraph` service
if (process.env.NEXT_PUBLIC_PREVIEW_URL) {
  baseUrl = process.env.NEXT_PUBLIC_PREVIEW_URL;
  apiBaseUrl = "https://gallery-opengraph-preview.vercel.app";
} else if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") {
  baseUrl = "https://gallery-dev.vercel.app";
  apiBaseUrl = "https://gallery-opengraph-preview.vercel.app";
}

const ABCDiatypeRegular = fetch(
  new URL("../../../../assets/fonts/ABCDiatype-Regular.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const ABCDiatypeBold = fetch(
  new URL("../../../../assets/fonts/ABCDiatype-Bold.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const alpinaLight = fetch(
  new URL(
    "../../../../assets/fonts/GT-Alpina-Standard-Light.ttf",
    import.meta.url,
  ),
).then((res) => res.arrayBuffer());

export default async function handler(request: NextRequest) {
  try {
    const path = request.nextUrl;
    const url = new URL(path, baseUrl);
    const tokenId = url.searchParams.get("tokenId");

    const queryResponse = await fetchWithJustQueryText({
      queryText: tokenIdOpengraphQuery,
      variables: { tokenId: tokenId ?? "" },
    });

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    const { token } = queryResponse.data;
    if (!token) {
      return new ImageResponse(<div>Visit gallery.so</div>, {
        width: 1200,
        height: 630,
      });
    }

    const result = getPreviewUrls(token.definition.media);

    if (!tokenId || !queryResponse?.data?.token) {
      return new ImageResponse(<div>Visit gallery.so</div>, {
        width: 1200,
        height: 630,
      });
    }

    const tokenImageUrl = result?.large ?? "";
    const title = token.definition.name;
    console.log("token.definition.name", title);

    const collectorsNoteText = "“" + token.collectorsNote + " ”";

    const description = token.definition.description ?? "";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            minHeight: 200,
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 25,
              justifyContent: "center",
              alignItems: "center",
              height: "87%",
            }}
          >
            <img
              src={tokenImageUrl}
              style={{
                maxWidth: "265px",
                display: "block",
                objectFit: "contain",
              }}
              alt="post"
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 25,
            }}
          >
            <p
              style={{
                fontFamily: "'GT Alpina'",
                fontSize: "32px",
                fontWeight: 400,
                lineHeight: "36px",
                letterSpacing: "0px",
                margin: 0,
              }}
            >
              {title}
            </p>
            {description && (
              <p
                style={{
                  fontFamily: "'ABCDiatype-Regular'",
                  fontSize: "18px",
                  fontWeight: 400,
                  lineHeight: "24px",
                  margin: 0,
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      ),
      {
        width: WIDTH_OPENGRAPH_IMAGE,
        height: HEIGHT_OPENGRAPH_IMAGE,
        fonts: [
          {
            name: "ABCDiatype-Regular",
            data: ABCDiatypeRegularFontData,
            weight: 400,
          },
          {
            name: "ABCDiatype-Bold",
            data: ABCDiatypeBoldFontData,
            weight: 700,
          },
          {
            name: "GT Alpina",
            data: alpinaLightFontData,
            style: "normal",
            weight: 500,
          },
        ],
      },
    );
  } catch (e) {
    console.log("error: ", e);
  }
}