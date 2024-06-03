import {
    DiscoverListing,
    DiscoverListingOrientationType,
    DiscoverListingType,
    Paging,
    Playlist,
    PlaylistItem,
    PlaylistGroup,
    PlaylistDetails,
    PlaylistEpisodeServer,
    PlaylistEpisodeServerFormatType,
    PlaylistEpisodeServerQualityType,
    PlaylistEpisodeServerRequest,
    PlaylistEpisodeServerResponse,
    PlaylistEpisodeSource,
    PlaylistEpisodeSourcesRequest,
    PlaylistItemsResponse,
    PlaylistStatus,
    PlaylistType,
    SearchFilter,
    SearchQuery,
    SourceModule,
    DiscoverListingsRequest,
    PlaylistItemsOptions,
} from "@mochiapp/js";

import * as cheerio from "cheerio";
import { baseUrl } from "./utils/constants";
import { getPlaylistDetails } from "./scrapper/getPlaylistDetails";
import { getPlaylistEpisodes } from "./scrapper/getPlaylistEpisodes";
import { getPlaylistEpisodeServer } from "./scrapper/getPlaylistEpisodeServer";
import { getHomeListings } from "./scrapper/getHomeListings";
import { getSearch } from "./scrapper/getSearch";

export default class ShibaAnime extends SourceModule {
    metadata = {
        id: "ShibaAnime",
        name: "ShibaAnime",
        version: "1.0.0",
        icon: "https://i.imgur.com/Wrwlre8.png",
    };
    async searchFilters(): Promise<SearchFilter[]> {
        return []
    }
    async search(query: SearchQuery): Promise<Paging<Playlist>> {
        return await getSearch(query);
    }
    async discoverListings(listingsRequest?: DiscoverListingsRequest | undefined): Promise<DiscoverListing[]> {
        const carousels: DiscoverListing[] = [];
        const home = await getHomeListings(listingsRequest?.page);
        carousels.push({
            id: "Latest",
            title: "อัพเดทล่าสุด",
            type: DiscoverListingType.default,
            orientation: DiscoverListingOrientationType.portrait,
            paging: {
                id: listingsRequest?.page ?? "1",
                items: home.items,
                previousPage: listingsRequest?.page ?? undefined,
                nextPage: `${home.id ? parseInt(home.id)+1 : 2}`,
            }
        })
        return [...carousels]
    }
    async playlistDetails(id: string): Promise<PlaylistDetails> {
        return await getPlaylistDetails(id);
    }

    async playlistEpisodes(playlistId: string, options?: PlaylistItemsOptions | undefined): Promise<PlaylistItemsResponse> {
        return await getPlaylistEpisodes(playlistId);
    }

    async playlistEpisodeSources(req: PlaylistEpisodeSourcesRequest): Promise<PlaylistEpisodeSource[]> {
        return [
            {
                displayName: "Main",
                id: "main-source",
                servers: [
                    {
                        displayName: "Server 1",
                        id: "server1"
                    }
                ]
            }
        ]
    }

    async playlistEpisodeServer(req: PlaylistEpisodeServerRequest): Promise<PlaylistEpisodeServerResponse> {
        return await getPlaylistEpisodeServer(req);
    }
}