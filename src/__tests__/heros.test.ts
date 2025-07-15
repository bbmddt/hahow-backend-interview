import request from 'supertest';
import { AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import app from '../app';
import * as hahowApi from '../api/hahow.api';

// Mock the entire hahow.api module BEFORE any tests run
jest.mock('../api/hahow.api');

// Create a typed mock function for better intellisense and type safety
const mockedGetHeroes = hahowApi.getHeroes as jest.Mock;
const mockedGetHeroById = hahowApi.getHeroById as jest.Mock;
const mockedGetHeroProfileById = hahowApi.getHeroProfileById as jest.Mock;
const mockedAuthenticate = hahowApi.authenticate as jest.Mock;

describe('Heroes API with Mocking', () => {
  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Test suite for public endpoints using mocks
  describe('Public GET /heroes/:heroId', () => {
    it('should return a hero when hahowApi.getHeroById succeeds', async () => {
      // Arrange: setup the mock implementation for this specific test
      const heroId = '1';
      const mockHero = { id: heroId, name: 'Mocked Hero', image: 'url' };
      mockedGetHeroById.mockResolvedValue(mockHero);

      // Act
      const res = await request(app).get(`/heroes/${heroId}`);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Mocked Hero');
      // Ensure the mocked function was called correctly
      expect(mockedGetHeroById).toHaveBeenCalledWith(heroId);
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
    it('should return heroes without profiles when no credentials are provided', async () => {
      // Arrange
      const mockHeroes = [{ id: '1', name: 'Public Hero', image: 'url' }];
      mockedGetHeroes.mockResolvedValue(mockHeroes);

      // Act
      const res = await request(app).get('/heroes');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.heroes).toBeInstanceOf(Array);
      expect(res.body.heroes[0].name).toBe('Public Hero');
      expect(res.body.heroes[0]).not.toHaveProperty('profile');
      // Ensure authentication was not even attempted
      expect(mockedAuthenticate).not.toHaveBeenCalled();
    });
  });

  // Test suite for authenticated endpoints
  describe('Authenticated GET /heroes', () => {
    it('should return heroes with profiles when authentication is successful', async () => {
      // Arrange
      const mockHeroes = [{ id: '1', name: 'Auth Hero', image: 'url' }];
      const mockProfile = { str: 10, int: 10, agi: 10, luk: 10 };
      
      mockedAuthenticate.mockResolvedValue(true);
      mockedGetHeroes.mockResolvedValue(mockHeroes);
      mockedGetHeroProfileById.mockResolvedValue(mockProfile);

      // Act
      const res = await request(app)
        .get('/heroes')
        .set('Name', 'testuser')
        .set('Password', 'password'); // Use mock credentials

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.heroes[0]).toHaveProperty('profile');
      expect(res.body.heroes[0].profile).toEqual(mockProfile);
      // Ensure authentication was attempted
      expect(mockedAuthenticate).toHaveBeenCalledWith('testuser', 'password');
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

    it('should return a single hero with profile when authentication is successful', async () => {
      // Arrange
      mockedAuthenticate.mockResolvedValue(true);
      mockedGetHeroById.mockResolvedValue(mockHero);
      mockedGetHeroProfileById.mockResolvedValue(mockProfile);

      // Act
      const res = await request(app)
        .get(`/heroes/${heroId}`)
        .set('Name', 'testuser')
        .set('Password', 'password');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('profile');
      expect(res.body.profile).toEqual(mockProfile);
      expect(mockedGetHeroById).toHaveBeenCalledWith(heroId);
      expect(mockedGetHeroProfileById).toHaveBeenCalledWith(heroId);
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
    });
  });
});
