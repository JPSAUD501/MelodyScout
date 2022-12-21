export class MsAuth {
  static getUserAllowedTrackingChatIds(lastfmUserAboutMe: string): string[] {
    const aboutMeArray = lastfmUserAboutMe.split(/[\s\r]/);
    const allowedTrackingChatIds: string[] = [];
    aboutMeArray.forEach((word) => {
      if (word.startsWith("T:")) {
        allowedTrackingChatIds.push(word.replace("T:", ""));
      }
    });
    return allowedTrackingChatIds;
  }

  // TODO: getUserTelegramChatId(lastfmUserAboutMe: string): string | null {}

  // TODO: If user about me includes "T:ALL", allow all chat ids
}