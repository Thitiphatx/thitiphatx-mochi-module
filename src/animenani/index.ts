import {
  DiscoverListing,
  DiscoverListingOrientationType,
  DiscoverListingsRequest,
  DiscoverListingType,
  Paging,
  Playlist,
  PlaylistDetails,
  PlaylistEpisodeServerFormatType,
  PlaylistEpisodeServerQualityType,
  PlaylistEpisodeServerRequest,
  PlaylistEpisodeServerResponse,
  PlaylistEpisodeSource,
  PlaylistEpisodeSourcesRequest,
  PlaylistItem,
  PlaylistItemsOptions,
  PlaylistItemsResponse,
  PlaylistStatus,
  PlaylistType,
  SearchFilter,
  SearchQuery,
  SourceModule,
  VideoContent,
} from "@mochiapp/js";

import * as cheerio from "cheerio";

export default class AnimeNani extends SourceModule implements VideoContent {
  static BASE_URL = "https://anime-nani.net";
  static AJAX_URL = "https://ajax.gogo-load.com/ajax";

  metadata = {
    name: "AnimeNani",
    description: "A module to get data from ANIMENANI",
    icon: `https://anime-nani.net/wp-content/uploads/2021/11/icon88-150x150.jpg`,
    version: "0.0.1",
  };

  async searchFilters(): Promise<SearchFilter[]> {
    return [];
    //throw new Error("Method not implemented.");
  }

  async searchFilter(): Promise<SearchFilter[]> {
    return [];
    //throw new Error("Method not implemented.");
  }

  async search(query: SearchQuery): Promise<Paging<Playlist>> {
    const page = query.page ?? "1";

    const response = await request.get(`${AnimeNani.BASE_URL}/page/${page}/?s=${query.query}`);

    const $ = cheerio.load(response.text());
    return parsePageListing($);
  }

  async discoverListings(listingsRequest?: DiscoverListingsRequest | undefined): Promise<DiscoverListing[]> {
    return Promise.all([{
      url: `${AnimeNani.BASE_URL}/new-season.html&page=${listingsRequest?.page ?? 1}`,
      title: 'Seasonal Anime',
      id: 'new-season',
      type: DiscoverListingType.featured,
    }, {
      url: `${AnimeNani.BASE_URL}/page/${listingsRequest?.page ?? 1}/`,
      title: 'Latests',
      id: 'latests',
      type: DiscoverListingType.default,
    }].map(async page => {
      const html = await request.get(page.url)
      const $ = cheerio.load(html.text());
      const pages = $('#main > div.pagination > ul.pagination > li.page-item');
      const currentPageIndex = pages.filter('li.active').index();
      const items: Playlist[] = $('#main > div.row.ez-row.ez-bt5.hentry > article').map((anime) => {
        const animeRef = $(anime);
        const url = animeRef.find('div.movie-box1 > div.img > a').attr('href') ?? '';
        const name = animeRef.find('div.movie-box1 > h3 > div.anime-title').text();
        const img = animeRef.find('div.movie-box1 > div.img > a > img').attr('src') ?? '';
        const id = url?.split('/')[3] ?? '';
        return {
          id,
          url: `${url}`,
          status: PlaylistStatus.unknown,
          type: PlaylistType.video,
          title: name,
          bannerImage: img,
          posterImage: img,
        } satisfies Playlist
      }).get();

      const hasNextPage = pages.length > currentPageIndex + 2
      const baseName = page.url.split('&')[0]
      return {
        title: page.title,
        type: page.type,
        id: page.id,
        orientation: DiscoverListingOrientationType.landscape,
        paging: {
          id: 'top-airing',
          title: "Top Airing",
          previousPage: `${baseName}&page=${Math.max(1, currentPageIndex)}`,
          nextPage: hasNextPage ? `${baseName}&page=${Math.min(pages.length, currentPageIndex + 2)}` : undefined,
          items: items,
        }
      }
    }))
  }

  async playlistDetails(id: String): Promise<PlaylistDetails> {
    const html = await request.get(`${AnimeNani.BASE_URL}/${id}/`)
    const $ = cheerio.load(html.text());
    const info = $('article > div.anime > div.container > div:nth-child(4) > blockquote > p:nth-child(1)').text().trim()
    const yearReleased = $('article > div.anime > div.container > div:nth-child(2) > div > span:nth-child(13)').text().split(", ")[1]
    const genres = $('article > div.anime > div.container > div.anime-flex > div.anime-flexright > div:nth-child(5) > span.ez-e-t-second > a').map((item)=> {
      return $(item).text().split(" ")[0]
    }).get();
    return {
      synopsis: info ?? '',
      genres: genres,
      yearReleased: parseInt(yearReleased),
      previews: [],
      altBanners: [],
      altPosters: [],
      altTitles: [],
    } satisfies PlaylistDetails
  }

  async playlistEpisodes(playlistId: string, options?: PlaylistItemsOptions | undefined): Promise<PlaylistItemsResponse> {
    console.log(`options: ${options}`);
    const html = (
      await request.get(`${AnimeNani.BASE_URL}/${playlistId}/`)
    ).text();

    let $ = cheerio.load(html);

    try {
      let list: PlaylistItem[] = []
      $("div.all-episode-link > div.collapse.show > div.episode-item").map((_, el) => {
        list.push({
          id: $(el).find('a').attr("href") ?? "",
          title: $(el).find('a > div.epsiode-title > p > span.ep-name-02').text(),
          number: parseFloat($(el).find('a > div.epsiode-title > p > span.ep-name-02').text().split(" ")[1]),
          tags: []
        })
      })

      return [
        {
          id: "",
          number: 1,
          altTitle: "Episodes",
          variants: [
            {
              id: "",
              title: $("article > div > div > div.anime-flex > div.anime-flexright > h1").text().split(" ").reverse()[0],
              pagings: [
                {
                  id: "",
                  items: list
                }
              ]
            }
          ]
        }
      ];
    } catch(error) {
      console.log(error)
      return []
    }
  }
  
  async playlistEpisodeSources(req: PlaylistEpisodeSourcesRequest): Promise<PlaylistEpisodeSource[]> {
    console.log(req.episodeId)
    return [
      {
        displayName: "Main",
        id: "main-source",
        servers: [
          {
            displayName: "Google Drive 1",
            id: "google-drive-1"
          },
          {
            displayName: "Google Drive 2",
            id: "google-drive-2"
          }
        ]
      }
    ]
  }

  async playlistEpisodeServer(req: PlaylistEpisodeServerRequest): Promise<PlaylistEpisodeServerResponse> {

    const $1 = cheerio.load(await request.get(req.episodeId).then(t => t.text()))
    const embedAddr = $1('#mpPlayer > div.mpIframe > iframe').attr("src") ?? "";
    
    let sourceAddr = "";

    if (embedAddr) {
      const $2 = cheerio.load(await request.get(embedAddr).then(t => t.text()));
      const scriptContent = $2('#videoUrlForm > script:nth-child(1)').html();
      const match = scriptContent?.match(/hls = '(https:\/\/[^']+)';/);

      sourceAddr = match?.[1] ?? "";
    }

    const $3 = cheerio.load(await request.get(sourceAddr).then(t => t.text()))
    const playlistString = $3('body').text()
    const pattern = /#EXT-X-STREAM-INF:BANDWIDTH=\d+,\s*RESOLUTION=(\d+x\d+)\s*\n(https:\/\/[^\n]+)/g;

    const matches = [...playlistString.matchAll(pattern)];

    const resolutions = matches.map(match => match[1]);
    const urls = matches.map(match => match[2]);
    
    let qualities = [];
    for (let i = 0; i < resolutions.length; i++) {
      const quality = resolutions[i];
      
      qualities.push({
        url: `${urls[i]}`,
        format: PlaylistEpisodeServerFormatType.hsl,
        quality: quality.includes("1080") ? PlaylistEpisodeServerQualityType.q1080p : quality.includes("720") ?
          PlaylistEpisodeServerQualityType.q720p : quality.includes("480") ?
          PlaylistEpisodeServerQualityType.q480p : PlaylistEpisodeServerQualityType.q360p
      })
    }
    return {
      headers: {},
      links: qualities.reverse(),
      skipTimes: [],
      subtitles: [],
    }
  }
}

const parsePageListing = ($: cheerio.Root): Paging<Playlist> => {
  const items: Playlist[] = [];

  $('#main > div.row.ez-row.ez-bt5').children("article").each((_, element) => {
      const id = $(element).find("div.movie-box1 > div > a").attr("href")?.split("/")[3] ?? "";
      const title = $(element).find("div.movie-box1 > h3 > div").first().text();
      const image = $(element).find("div.movie-box1 > div > a > img").first().attr("src");

      // Some links aren't url encoded.
      let encodedImage: string | undefined;

      if (image) encodedImage = encodeURI(image);
      items.push({
          id,
          title: title,
          posterImage: encodedImage,
          url: `${AnimeNani.BASE_URL}/${id}/`,
          status: PlaylistStatus.completed,
          type: PlaylistType.video
      });
  });

  return {
      id: "",
      previousPage: undefined,
      nextPage: undefined,
      items: items
  };
};