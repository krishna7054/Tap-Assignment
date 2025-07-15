import React,{ useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import { authHeaders } from "../utils/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import { Calendar, Clock, MapPin, Zap, Undo2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

function SessionHistory() {
  const [sessions, setSessions] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef(null)
  const loadingRef = useRef(null)
  const nav=useNavigate();

  useEffect(() => {
    fetchSessions(page)
  }, [page])

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(p => p + 1)
        }
      },
      { threshold: 1.0 }
    )

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current)
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [hasMore, loading])

  const fetchSessions = async (pageNumber) => {
    try {
      setLoading(true)
      const res = await axios.get(`https://tap-assignment.onrender.com/api/sessions?page=${pageNumber}`, {
        headers: authHeaders()
      })
      const data = res.data

      if (Array.isArray(data)) {
        setSessions(prev => [...prev, ...data])
        if (data.length === 0) setHasMore(false)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error("Failed to load sessions:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const history=()=>{
    nav("/");
  }

  if (sessions.length === 0 && !loading) {
    return (
      
        
      <Card>
        <CardHeader>
           <Button variant="outline" className="mb-4" onClick={() => history()}>
        <Undo2 className="w-5 h-5" />
        Go Back
      </Button>
          <CardTitle className="text-2xl">Session History</CardTitle>
          <CardDescription>Your jogging sessions will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
            <p className="text-muted-foreground">Start your first jogging session to see it here!</p>
          </div>
        </CardContent>
      </Card>
      
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
    <div className="space-y-6 ">
      <Card>
        <CardHeader>
      <Button variant="outline" className="mb-4" onClick={() => history()}>
        <Undo2 className="w-5 h-5" />
        Go Back
      </Button>
          <CardTitle className="text-2xl">Session History</CardTitle>
          {/* <CardTitle className="text-2xl flex j">Session History</CardTitle> */}
          <CardDescription>
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} completed
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {sessions.map((s, i) => (
          <Card key={s._id || i} className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Session #{sessions.length - i}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(s.date)}
                  </p>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{formatTime(s.duration)}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{(s.distance / 1000).toFixed(2)} km</div>
                    <div className="text-xs text-muted-foreground">Distance</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{s.averageSpeed?.toFixed(1)} m/s</div>
                    <div className="text-xs text-muted-foreground">Avg Speed</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold">{s.path?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">GPS Points</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Pace: {s.duration > 0 ? (s.duration / 60 / (s.distance / 1000)).toFixed(2) : "0.00"} min/km
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {hasMore && (
          <div ref={loadingRef} className="flex justify-center py-4 text-muted-foreground">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                Loading more sessions...
              </div>
            ) : (
              <span>Scroll down to load more</span>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default React.memo(SessionHistory);