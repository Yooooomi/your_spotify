const packageJson = require('../../package.json');

export class Version {
  private constructor(private readonly parts: number[]) {}

  static from(version: string) {
    return new Version(version.split('.').map(entry => Number(entry)));
  }

  static thisOne() {
    return Version.from(packageJson.version as string);
  }

  isNewerThan(version: Version) {
    for (let i = 0; i < this.parts.length; i += 1) {
      const currentPart = this.parts[i];
      const currentVersionPart = version.parts[i];

      if (currentPart && !currentVersionPart) {
        return true;
      }
      if (currentPart > currentVersionPart) {
        return true;
      }
    }
    return false;
  }
}
