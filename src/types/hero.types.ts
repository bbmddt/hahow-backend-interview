export interface Hero {
  id: string;
  name: string;
  image: string;
}

export interface HeroProfile {
  str: number;
  int: number;
  agi: number;
  luk: number;
}

export interface AuthenticatedHero extends Hero {
  profile: HeroProfile;
}