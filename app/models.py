from django.db import models

# Create your models here.
class Genre(models.Model):
    title = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.title}"

class User(models.Model):
    userId = models.IntegerField()
    gender = models.CharField(max_length=1)
    age = models.IntegerField()
    occupation = models.IntegerField()
    zipCode = models.CharField(max_length=20)

    def __str__(self):
        return f"User ({self.userId})"

class Movie(models.Model):
    movieId = models.IntegerField()
    title = models.CharField(max_length=300)
    year = models.IntegerField()
    imdbId = models.CharField(max_length=10)
    tmdbId = models.CharField(max_length=10)
    genres = models.ManyToManyField(Genre)

    def __str__(self):
        return f"{self.title} ({self.year})"

class Rating(models.Model):
    userId = models.IntegerField()
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    timestamp = models.CharField(max_length=50)

    def __str__(self):
        return f"User {self.userId} rated {self.movie} as: {self.rating}"