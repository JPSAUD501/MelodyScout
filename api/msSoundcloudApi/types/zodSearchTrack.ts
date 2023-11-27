import { z } from 'zod'

export const zodSoundcloudTrack = z.object({
  artwork_url: z.string().nullable().optional(),
  caption: z.null().optional(),
  commentable: z.boolean().nullable().optional(),
  comment_count: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  downloadable: z.boolean().nullable().optional(),
  download_count: z.number().nullable().optional(),
  duration: z.number().nullable().optional(),
  full_duration: z.number().nullable().optional(),
  embeddable_by: z.string().nullable().optional(),
  genre: z.string().nullable().optional(),
  has_downloads_left: z.boolean().nullable().optional(),
  id: z.number().nullable().optional(),
  kind: z.string().nullable().optional(),
  label_name: z.string().nullable().optional(),
  last_modified: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  likes_count: z.number().nullable().optional(),
  permalink: z.string().nullable().optional(),
  permalink_url: z.string().nullable().optional(),
  playback_count: z.number().nullable().optional(),
  public: z.boolean().nullable().optional(),
  publisher_metadata: z.object({
    id: z.number().nullable().optional(),
    urn: z.string().nullable().optional(),
    artist: z.string().nullable().optional(),
    album_title: z.string().nullable().optional(),
    contains_music: z.boolean().nullable().optional(),
    upc_or_ean: z.string().nullable().optional(),
    isrc: z.string().nullable().optional(),
    explicit: z.boolean().nullable().optional(),
    p_line: z.string().nullable().optional(),
    p_line_for_display: z.string().nullable().optional(),
    c_line: z.string().nullable().optional(),
    c_line_for_display: z.string().nullable().optional(),
    writer_composer: z.string().nullable().optional(),
    release_title: z.string().nullable().optional()
  }).nullable().optional(),
  purchase_title: z.string().nullable().optional(),
  purchase_url: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  reposts_count: z.number().nullable().optional(),
  secret_token: z.null().optional(),
  sharing: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  streamable: z.boolean().nullable().optional(),
  tag_list: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  track_format: z.string().nullable().optional(),
  uri: z.string().nullable().optional(),
  urn: z.string().nullable().optional(),
  user_id: z.number().nullable().optional(),
  visuals: z.unknown().nullable().optional(),
  waveform_url: z.string().nullable().optional(),
  display_date: z.string().nullable().optional(),
  media: z.object({
    transcodings: z.array(
      z.object({
        url: z.string(),
        preset: z.string(),
        duration: z.number(),
        snipped: z.boolean(),
        format: z.object({ protocol: z.string(), mime_type: z.string() }),
        quality: z.string()
      })
    )
  }).nullable().optional(),
  station_urn: z.string().nullable().optional(),
  station_permalink: z.string().nullable().optional(),
  track_authorization: z.string().nullable().optional(),
  monetization_model: z.string().nullable().optional(),
  policy: z.string().nullable().optional(),
  user: z.object({
    avatar_url: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    comments_count: z.number().nullable().optional(),
    country_code: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    creator_subscriptions: z.array(
      z.object({ product: z.object({ id: z.string().nullable().optional() }).nullable().optional() }).nullable().optional()
    ).nullable().optional(),
    creator_subscription: z.object({
      product: z.object({ id: z.string().nullable().optional() }).nullable().optional()
    }).nullable().optional(),
    description: z.string().nullable().optional(),
    followers_count: z.number().nullable().optional(),
    followings_count: z.number().nullable().optional(),
    first_name: z.string().nullable().optional(),
    full_name: z.string().nullable().optional(),
    groups_count: z.number().nullable().optional(),
    id: z.number().nullable().optional(),
    kind: z.string().nullable().optional(),
    last_modified: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    likes_count: z.number().nullable().optional(),
    playlist_likes_count: z.number().nullable().optional(),
    permalink: z.string().nullable().optional(),
    permalink_url: z.string().nullable().optional(),
    playlist_count: z.number().nullable().optional(),
    reposts_count: z.null().optional(),
    track_count: z.number().nullable().optional(),
    uri: z.string().nullable().optional(),
    urn: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    verified: z.boolean().nullable().optional(),
    visuals: z.object({
      urn: z.string().nullable().optional(),
      enabled: z.boolean().nullable().optional(),
      visuals: z.array(
        z.object({
          urn: z.string().nullable().optional(),
          entry_time: z.number().nullable().optional(),
          visual_url: z.string().nullable().optional()
        })
      ).nullable().optional(),
      tracking: z.null().optional()
    }).nullable().optional(),
    badges: z.object({
      pro: z.boolean().nullable().optional(),
      pro_unlimited: z.boolean().nullable().optional(),
      verified: z.boolean().nullable().optional()
    }),
    station_urn: z.string().nullable().optional(),
    station_permalink: z.string().nullable().optional()
  }).nullable().optional()
})
export type SoundcloudTrack = z.infer<typeof zodSoundcloudTrack>

export const zodSearchTrack = z.object({
  collection: z.array(zodSoundcloudTrack),
  total_results: z.number(),
  next_href: z.string(),
  query_urn: z.string()
})
export type SearchTrack = z.infer<typeof zodSearchTrack>
