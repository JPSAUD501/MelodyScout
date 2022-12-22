import { UserInfo } from "../../api/msLastfmApi/types/zodUserInfo";

export class TextFabric {
  static getHelpText(): string {
    const textArray: string[] = [
      "<b>Meus comandos!</b>",
      "",
      "<b>/start</b> - Inicia o bot",
      "<b>/help</b> - Mostra essa linda mensagem",
      "<b>/contact</b> - Mostra o contato do desenvolvedor",
      "",
      "<b>Aguarde! Mais comandos estão por vir!</b>",
    ];
    const text = textArray.join("\n");
    return text;
  }

  static getBriefText(userInfo: UserInfo): string {
    const { user } = userInfo;
    const textArray: string[] = [
      `<b>Resumo musical de <a href="${user.url}">${user.realname || user.name}</a></b>`,
      '',
      `<b>Conquistas:</b>`,
      `- Músicas ouvidas: ${Number(user.playcount)}`,
      `- Músicas conhecidas: ${Number(user.track_count)}`,
      `- Músicas repetidas: ${Number(user.playcount) - Number(user.track_count)}`,
      `- Artistas conhecidos: ${Number(user.artist_count)}`,
      `- Álbuns conhecidos: ${Number(user.album_count)}`,
    ];
    const text = textArray.join("\n");
    return text;
  }
}