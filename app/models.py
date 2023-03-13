from django.db import models

# Create your models here.
class Genre(models.Model):
    title = models.CharField(max_length=300)

class Movie(models.Model):
    movieId = models.IntegerField()
    title = models.CharField(max_length=300)
    year = models.IntegerField()
    imdbId = models.CharField(max_length=10)
    tmdbId = models.CharField(max_length=10)
    genres = models.ManyToManyField(Genre)

class Tag(models.Model):
    userId = models.IntegerField()
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    tag = models.CharField(max_length=300)
    timestamp = models.DateTimeField(max_length=50)

class Rating(models.Model):
    userId = models.IntegerField()
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    timestamp = models.CharField(max_length=50)

class Genome_Score(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    tagId = models.IntegerField()
    relevance = models.CharField(max_length=50)

class Genome_Tag(models.Model):
    tagId = models.IntegerField()
    tag = models.CharField(max_length=100)