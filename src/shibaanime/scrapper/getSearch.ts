import { Playlist, PlaylistStatus, PlaylistType, Paging, SearchQuery } from "@mochiapp/js/dist";
import { baseUrl } from "../utils/constants";
import * as cheerio from "cheerio";


export async function getSearch(query: SearchQuery): Promise<Paging<Playlist>> {
    const response = await request.get(`${baseUrl}/search/page/${query.page ?? 1}?q=${query.query}`);;
    const $ = cheerio.load(response.text());
    const items: Playlist[] = [];
    const isNextPage = $('ul.pagination > li').toArray().length;

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
        id: `${query.page ?? 1}`,
        title: `${query.query}`,
        previousPage: `${query.page ?? undefined}`,
        nextPage: `${isNextPage > 0 ? (query.page ? parseInt(query.page) + 1 : 2) : undefined}`,
        items,
    }
}
