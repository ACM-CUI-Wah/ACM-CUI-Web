from rest_framework.decorators import api_view, schema
from rest_framework.response import Response
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "message": "Render instance is awake"})

@api_view(['GET', 'POST'])
@schema(None)
def api_root(request):
    if request.method == 'POST':
        return Response({
            'message': 'Server is online. API functional.',
            'data': request.data
        })
    return Response({"message": "Server is online. API functional."})
