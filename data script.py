import pandas as pd
import re
from datetime import datetime, timezone
from app.models import *


df_movies = pd.read_csv('movies.dat', sep = '::', engine = 'python', encoding = 'latin-1', header = None)

# create Genre table
#df_movies = pd.read_csv('movies.csv')
genre_set = set()
for index, row in df_movies.iterrows():
    for genre in row[2].split("|"):
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
    obj.movieId = row[0]
    match = re.search(r'\((\d{4})\)$', row[1])
    if match:
        year = match.group(1)
        title = re.sub(r'\s*\(\d{4}\)$', '', row[1])
    obj.title = title
    obj.year = year
    obj.save()

print("GENRES TO MOVIES TIME")
for index, row in df_movies.iterrows():
    obj = Movie.objects.get(movieId=row[0])
    for genre in row[2].split("|"):
        obj.genres.add(Genre.objects.get(title=genre))

# # add links to Movie table (connects movies with their IMDB and TMDB links)
# print("LINKS TIME")
# df_links = pd.read_csv('links.csv', dtype=str)
# for index, row in df_links.iterrows():
#     obj = Movie.objects.get(movieId=row['movieId'])
#     obj.imdbId = row['imdbId']
#     obj.tmdbId = row['tmdbId']
#     obj.save()

# # create Tag table
# print("TAGS TIME")
# df_tags = pd.read_csv('tags.csv')
# for index, row in df_tags.iterrows():
#     obj = Tag()
#     obj.movie = Movie.objects.get(movieId=row['movieId'])
#     obj.userId = row['userId']
#     obj.tag = row['tag']
#     obj.timestamp = datetime.fromtimestamp(row['timestamp'], timezone.utc)
#     obj.save()

# print("GENOME SCORES TIME")
# # create Genome_Score table
# df_genome_scores = pd.read_csv('genome-scores.csv')
# for index, row in df_genome_scores.iterrows():
#     obj = Genome_Score()
#     obj.movie = Movie.objects.get(movieId=row['movieId'])
#     obj.tagId = row['tagId']
#     obj.relevance = row['relevance']
#     obj.save()

# print("GENOME TAGS TIME")
# # create Genome_Tag table
# df_genome_tags = pd.read_csv('genome-tags.csv')
# for index, row in df_genome_tags.iterrows():
#     obj = Genome_Tag()
#     obj.tagId = row['tagId']
#     obj.tag = row['tag']
#     obj.save()


# create Users table
print("USERS TIME")
df_users = pd.read_csv('users.csv')
for index, row in df_users.iterrows():
    obj = Users()
    obj.userId = row['userId']
    obj.gender = row['gender']
    obj.age = row['age']
    obj.occupation = row['occupation']
    obj.zipCode = row['zip-code']
    obj.save()

print("RATINGS TIME")
# create Rating table (note from Quinn: Had to adjust this, as for some reason it was misbehaving...?)
df_ratings = pd.read_csv('ratings.csv', dtype=str)
for row in df_ratings.values:
    obj = Rating()
    obj.userId = Users.objects.get(userId=row[0])
    obj.movie = Movie.objects.get(movieId=row[1])
    obj.rating = row[2]
    obj.timestamp = datetime.fromtimestamp(int(row[3]), timezone.utc)
    obj.save()


# close