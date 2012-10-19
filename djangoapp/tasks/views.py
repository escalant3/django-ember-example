from django.http import HttpResponse


def main(request):
	# Keeping things simple to avoid handlebars/django templates conflicts
	# We are trying to show tastypie/ember integration so... this is OK
    template_file = open('tasks/templates/index.html')
    html_content = template_file.read()
    template_file.close()
    return HttpResponse(html_content)
