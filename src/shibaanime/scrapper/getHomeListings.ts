import { Playlist, PlaylistStatus, PlaylistType } from "@mochiapp/js/dist";
import { baseUrl } from "../utils/constants";
import * as cheerio from "cheerio";

export async function getHomeListings(page: string | undefined) {
    const response = await request.get(`${baseUrl}/page/${page ?? "1"}`);;
    const $ = cheerio.load(response.text());
    const items: Playlist[] = [];

    for (const element of $('div.flex-wrap-movielist > div').toArray()) {
        const url = $('a' , element).attr('href') ?? '';
        const title = $('div.mv-item-infor > h6', element).text() ?? 'no title';
        const posterImage = $('a > img', element).attr('data-src') ?? '';
        const id = url.split("/")[4];
        items.push({
            id,
            url,
            title,
            posterImage,
            bannerImage: posterImage,
            status: PlaylistStatus.unknown,
            type: PlaylistType.video,
        } satisfies Playlist)
    }

    return {
        id: page,
        items
    }
}