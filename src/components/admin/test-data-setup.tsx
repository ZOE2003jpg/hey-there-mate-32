import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function TestDataSetup() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const createTestUsers = async () => {
    setLoading(true)
    setResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('create-test-users')
      
      if (error) {
        console.error('Edge function error:', error)
        toast({
          title: "Error",
          description: "Failed to create test users. Check console for details.",
          variant: "destructive"
        })
        return
      }

      setResult(data)
      
      if (data.success) {
        toast({
          title: "Success!",
          description: "Test users and data created successfully.",
        })
      } else {
        toast({
          title: "Partial Success",
          description: "Some users may have failed to create. Check results below.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error calling function:', error)
      toast({
        title: "Error",
        description: "Failed to call create-test-users function.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Test Data Setup
          </CardTitle>
          <CardDescription>
            Create test user accounts and sample data for testing the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Test Accounts to be Created:</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span><strong>Writer:</strong> testwriter@example.com</span>
                  <Badge variant="secondary">password123</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span><strong>Reader:</strong> testreader@example.com</span>
                  <Badge variant="secondary">password123</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span><strong>Admin:</strong> testadmin@example.com</span>
                  <Badge variant="secondary">password123</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Sample Data Included:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>3 test stories with chapters and slides</li>
                <li>Reading progress and library entries</li>
                <li>Sample comments and likes</li>
                <li>User profiles with different roles</li>
              </ul>
            </div>

            <Button 
              onClick={createTestUsers} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Test Users...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Create Test Users & Data
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Results:</h4>
              <div className="space-y-2">
                {result.users?.map((user: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                  >
                    <span>{user.email}</span>
                    <div className="flex items-center gap-2">
                      {user.status === 'created' && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Created
                        </Badge>
                      )}
                      {user.status === 'already_exists' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Exists
                        </Badge>
                      )}
                      {user.status === 'error' && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {result.message && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  {result.message}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}