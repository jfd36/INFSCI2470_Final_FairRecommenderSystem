import csv, json
from .models import *
import random

from django.views.generic import TemplateView
from django.http import (
    HttpResponse,
    HttpResponseForbidden,
    HttpResponseServerError,
    JsonResponse
)

# Create your views here.
class index(TemplateView):
    template_name = "index.html"

class example(TemplateView):
    template_name = "example.html"

def cluster_csv(request):
    data = {}

    with open('clustering_with_pickle_coordinates_v2.csv', encoding='utf-8') as f:
        csvReader = csv.DictReader(f)

        for row in csvReader:
            key = row['user_id']
            data[key] = row
        
        return HttpResponse(
            json.dumps(data),
            content_type='application/json'
        )

def fetch_user_info(request):
    userId = request.POST.get('userId')
    user = Users.objects.get(userId=userId)
    data = {
        'gender': user.gender,
        'age': user.age,
        'occupation': user.occupation,
        'zipCode': user.zipCode,
        'genreRatings': user.genreRatings
    }

    return HttpResponse(
        json.dumps(data),
        content_type='application/json'
    )

def get_movies(request):
    random_movies = Movie.objects.order_by('?')[:10]
    movies = {}
    for i, movie in enumerate(random_movies):
        movies[i] = {
            'title': movie.title,
            'year': movie.year,
            'poster': movie.poster,
        }
    return HttpResponse(
        json.dumps(movies),
        content_type='application/json'
    )

# Helper objects and functions for AJAX functionality
switch = {
    'fetch_user_info': {'call': fetch_user_info},
    'get_movies': {'call': get_movies},
    'cluster_csv': {'call': cluster_csv}
}

def ajax(request):
    """Switch to correct function given POST call

    Receives the following from POST:
    call -- What function to redirect to
    """
    post_call = request.POST.get('call', '')

    # Abort if there is no valid call sent to us from Javascript
    if not post_call:
        return HttpResponseServerError()

    # Route the request to the correct handler function
    # and pass request to the functions
    try:
        # select the function from the dictionary
        selection = switch[post_call]
    # If all else fails, handle the error message
    except KeyError:
        return HttpResponseServerError()

    else:
        procedure = selection.get('call')
        validation = selection.get('validation', None)
        if validation:
            valid = validation(request)

            if not valid:
                return HttpResponseForbidden()

        # execute the function
        return procedure(request)
    

