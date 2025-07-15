import request from 'supertest';
import { AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import app from '../app';
import * as hahowApi from '../api/hahow.api';
import cache from '../utils/cache';

// Mock the entire hahow.api module BEFORE any tests run
jest.mock('../api/hahow.api');
// Mock the cache module
jest.mock('../utils/cache');

// Create a typed mock function for better intellisense and type safety
const mockedGetHeroes = hahowApi.getHeroes as jest.Mock;
const mockedGetHeroById = hahowApi.getHeroById as jest.Mock;
const mockedGetHeroProfileById = hahowApi.getHeroProfileById as jest.Mock;
const mockedAuthenticate = hahowApi.authenticate as jest.Mock;
const mockedCacheGet = cache.get as jest.Mock;
const mockedCacheSet = cache.set as jest.Mock;

describe('Heroes API with Mocking and Cache', () => {
  // Reset mocks and clear cache before each test to ensure test isolation
  beforeEach(() => {
    jest.resetAllMocks();
    // Since we are mocking the cache, we can simulate flushing it
    mockedCacheGet.mockReturnValue(undefined); 
  });

  // Test suite for public endpoints using mocks
  describe('Public GET /heroes/:heroId', () => {
    it('should fetch from API on cache miss and serve from cache on hit', async () => {
      // Arrange
      const heroId = '1';
      const mockHero = { id: heroId, name: 'Mocked Hero', image: 'url' };
      mockedGetHeroById.mockResolvedValue(mockHero);

      // Act 1: First call (cache miss)
      const res1 = await request(app).get(`/heroes/${heroId}`);

      // Assert 1
      expect(res1.statusCode).toBe(200);
      expect(res1.body.name).toBe('Mocked Hero');
      expect(mockedGetHeroById).toHaveBeenCalledTimes(1); // API was called
      expect(mockedCacheSet).toHaveBeenCalledWith(`hero:${heroId}:public`, mockHero);

      // Arrange 2: Simulate cache hit for the next call
      mockedCacheGet.mockReturnValue(mockHero);

      // Act 2: Second call (cache hit)
      const res2 = await request(app).get(`/heroes/${heroId}`);

      // Assert 2
      expect(res2.statusCode).toBe(200);
      expect(res2.body.name).toBe('Mocked Hero');
      // The API function should NOT be called again
      expect(mockedGetHeroById).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when hahowApi.getHeroById throws a 404 error', async () => {
      // Arrange
      const heroId = '9999';
      // Create a more realistic AxiosError instance for the mock
      const axiosError = new AxiosError('Request failed with status code 404');
      axiosError.response = {
        data: {},
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        } as InternalAxiosRequestConfig,
      };
      mockedGetHeroById.mockRejectedValue(axiosError);

      // Act
      const res = await request(app).get(`/heroes/${heroId}`);

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Hero not found');
    });
  });

  // Test suite for public list of heroes
  describe('Public GET /heroes', () => {
    it('should fetch from API on cache miss and serve from cache on hit', async () => {
      // Arrange
      const mockHeroes = [{ id: '1', name: 'Public Hero', image: 'url' }];
      mockedGetHeroes.mockResolvedValue(mockHeroes);

      // Act 1: Cache Miss
      const res1 = await request(app).get('/heroes');

      // Assert 1
      expect(res1.statusCode).toBe(200);
      expect(res1.body.heroes[0].name).toBe('Public Hero');
      expect(mockedGetHeroes).toHaveBeenCalledTimes(1);
      expect(mockedCacheSet).toHaveBeenCalledWith('heroes:public', mockHeroes);

      // Arrange 2: Simulate cache hit
      mockedCacheGet.mockReturnValue(mockHeroes);

      // Act 2: Cache Hit
      const res2 = await request(app).get('/heroes');

      // Assert 2
      expect(res2.statusCode).toBe(200);
      expect(mockedGetHeroes).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  // Test suite for authenticated endpoints
  describe('Authenticated GET /heroes', () => {
    it('should fetch from API on cache miss and serve from cache on hit', async () => {
      // Arrange
      const mockHeroes = [{ id: '1', name: 'Auth Hero', image: 'url' }];
      const mockProfile = { str: 10, int: 10, agi: 10, luk: 10 };
      const authenticatedHeroes = [{ ...mockHeroes[0], profile: mockProfile }];
      
      mockedAuthenticate.mockResolvedValue(true);
      mockedGetHeroes.mockResolvedValue(mockHeroes);
      mockedGetHeroProfileById.mockResolvedValue(mockProfile);

      // Act 1: Cache Miss
      const res1 = await request(app)
        .get('/heroes')
        .set('Name', 'testuser')
        .set('Password', 'password');

      // Assert 1
      expect(res1.statusCode).toBe(200);
      expect(mockedGetHeroes).toHaveBeenCalledTimes(1);
      expect(mockedGetHeroProfileById).toHaveBeenCalledTimes(1);
      expect(mockedCacheSet).toHaveBeenCalledWith('heroes:authenticated', authenticatedHeroes);

      // Arrange 2: Simulate cache hit
      mockedCacheGet.mockReturnValue(authenticatedHeroes);

      // Act 2: Cache Hit
      const res2 = await request(app)
        .get('/heroes')
        .set('Name', 'testuser')
        .set('Password', 'password');
      
      // Assert 2
      expect(res2.statusCode).toBe(200);
      expect(res2.body.heroes[0].profile).toEqual(mockProfile);
      expect(mockedGetHeroes).toHaveBeenCalledTimes(1); // Not called again
      expect(mockedGetHeroProfileById).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should return heroes without profiles when authentication fails', async () => {
        // Arrange
        const mockHeroes = [{ id: '1', name: 'Auth Hero', image: 'url' }];
        // Simulate an authentication failure by rejecting with a 401 AxiosError
        const authError = new AxiosError('Authentication Failed');
        authError.response = {
          data: {},
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {
            headers: {} as AxiosRequestHeaders,
          } as InternalAxiosRequestConfig,
        };
        mockedAuthenticate.mockRejectedValue(authError);
        mockedGetHeroes.mockResolvedValue(mockHeroes);

        // Act
        const res = await request(app)
            .get('/heroes')
            .set('Name', 'testuser')
            .set('Password', 'wrongpassword');

        // Assert
        expect(res.statusCode).toBe(200);
        expect(res.body.heroes[0]).not.toHaveProperty('profile');
        // Ensure getHeroProfileById was NOT called because authentication failed
        expect(mockedGetHeroProfileById).not.toHaveBeenCalled();
    });
  });

  // Test suite for authenticated single hero endpoint
  describe('Authenticated GET /heroes/:heroId', () => {
    const heroId = '1';
    const mockHero = { id: heroId, name: 'Authenticated Hero', image: 'url' };
    const mockProfile = { str: 10, int: 10, agi: 10, luk: 10 };
    const authenticatedHero = { ...mockHero, profile: mockProfile };

    it('should fetch from API on cache miss and serve from cache on hit', async () => {
      // Arrange
      mockedAuthenticate.mockResolvedValue(true);
      mockedGetHeroById.mockResolvedValue(mockHero);
      mockedGetHeroProfileById.mockResolvedValue(mockProfile);

      // Act 1: Cache Miss
      const res1 = await request(app)
        .get(`/heroes/${heroId}`)
        .set('Name', 'testuser')
        .set('Password', 'password');

      // Assert 1
      expect(res1.statusCode).toBe(200);
      expect(mockedGetHeroById).toHaveBeenCalledTimes(1);
      expect(mockedGetHeroProfileById).toHaveBeenCalledTimes(1);
      expect(mockedCacheSet).toHaveBeenCalledWith(`hero:${heroId}:authenticated`, authenticatedHero);

      // Arrange 2: Simulate cache hit
      mockedCacheGet.mockReturnValue(authenticatedHero);

      // Act 2: Cache Hit
      const res2 = await request(app)
        .get(`/heroes/${heroId}`)
        .set('Name', 'testuser')
        .set('Password', 'password');

      // Assert 2
      expect(res2.statusCode).toBe(200);
      expect(res2.body.profile).toEqual(mockProfile);
      expect(mockedGetHeroById).toHaveBeenCalledTimes(1); // Not called again
      expect(mockedGetHeroProfileById).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should return a single hero without profile when authentication fails', async () => {
      // Arrange
      const authError = new AxiosError('Authentication Failed');
      authError.response = {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        } as InternalAxiosRequestConfig,
      };
      mockedAuthenticate.mockRejectedValue(authError);
      mockedGetHeroById.mockResolvedValue(mockHero);

      // Act
      const res = await request(app)
        .get(`/heroes/${heroId}`)
        .set('Name', 'testuser')
        .set('Password', 'wrongpassword');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).not.toHaveProperty('profile');
      expect(mockedGetHeroById).toHaveBeenCalledWith(heroId);
      // Ensure getHeroProfileById was NOT called
      expect(mockedGetHeroProfileById).not.toHaveBeenCalled();
      // Ensure the public version was cached upon auth failure (graceful degradation)
      expect(mockedCacheSet).toHaveBeenCalledWith(`hero:${heroId}:public`, mockHero);
    });
  });
});
