import pandas as pd
import re
from datetime import datetime, timezone
from app.models import *

# create Genre table
df_movies = pd.read_csv('movies.csv')
genre_set = set()
for index, row in df_movies.iterrows():
    for genre in row['genres'].split("|"):
        genre_set.add(genre)

print("GENRES TIME")
for genre in genre_set:
    obj = Genre()
    obj.title = genre
    obj.save()

print("MOVIES TIME")
# create Movie table 
for index, row in df_movies.iterrows():
    obj = Movie()
    obj.movieId = row['movieId']
    match = re.search(r'\((\d{4})\)$', row['title'])
    if match:
        year = match.group(1)
        title = re.sub(r'\s*\(\d{4}\)$', '', row['title'])
    obj.title = title
    obj.year = year
    obj.save()

print("GENRES TO MOVIES TIME")
for index, row in df_movies.iterrows():
    obj = Movie.objects.get(movieId=row['movieId'])
    for genre in row['genres'].split("|"):
        obj.genres.add(Genre.objects.get(title=genre))

# add links to Movie table (connects movies with their IMDB and TMDB links)
print("LINKS TIME")
df_links = pd.read_csv('links.csv', dtype=str)
for index, row in df_links.iterrows():
    obj = Movie.objects.get(movieId=row['movieId'])
    obj.imdbId = row['imdbId']
    obj.tmdbId = row['tmdbId']
    obj.save()

# create Tag table
print("TAGS TIME")
df_tags = pd.read_csv('tags.csv')
for index, row in df_tags.iterrows():
    obj = Tag()
    obj.movie = Movie.objects.get(movieId=row['movieId'])
    obj.userId = row['userId']
    obj.tag = row['tag']
    obj.timestamp = datetime.fromtimestamp(row['timestamp'], timezone.utc)
    obj.save()

print("GENOME SCORES TIME")
# create Genome_Score table
df_genome_scores = pd.read_csv('genome-scores.csv')
for index, row in df_genome_scores.iterrows():
    obj = Genome_Score()
    obj.movie = Movie.objects.get(movieId=row['movieId'])
    obj.tagId = row['tagId']
    obj.relevance = row['relevance']
    obj.save()

print("GENOME TAGS TIME")
# create Genome_Tag table
df_genome_tags = pd.read_csv('genome-tags.csv')
for index, row in df_genome_tags.iterrows():
    obj = Genome_Tag()
    obj.tagId = row['tagId']
    obj.tag = row['tag']
    obj.save()

print("RATINGS TIME")
# create Rating table
df_ratings = pd.read_csv('ratings.csv')
for index, row in df_ratings.iterrows():
    obj = Rating()
    obj.userId = row['userId']
    obj.movie = Movie.objects.get(movieId=row['movieId'])
    obj.rating = row['rating']
    obj.timestamp = datetime.fromtimestamp(row['timestamp'], timezone.utc)
    obj.save()