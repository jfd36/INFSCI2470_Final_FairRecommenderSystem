import json
from .models import *

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

# Create your AJAX functions here.
def fetch_movie_data(request):
    study = request.POST.get('study')
    data = {"movies": {}}

    movies = Movie.objects.all()
    for movie in movies:
        data["movies"][movie.title] = [movie.movieId, movie.title, movie.year, movie.imdbId, movie.tmdbId]

    return HttpResponse(
        json.dumps(data),
        content_type='application/json'
    )

# Helper objects and functions for AJAX functionality
switch = {
    'fetch_movie_data': {'call': fetch_movie_data},
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
