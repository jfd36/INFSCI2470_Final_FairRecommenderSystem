from django.views.generic import TemplateView

# Create your views here.
class index(TemplateView):
    template_name = "index.html"

class example(TemplateView):
    template_name = "example.html"
